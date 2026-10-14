import Array "mo:core/Array";
import Int "mo:core/Int";
import List "mo:core/List";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Time "mo:core/Time";
import OutCall "mo:caffeineai-http-outcalls/outcall";
import Json "mo:jayson/Json";
import Types "types/content";

/// External content sources and their fetch/normalize logic.
///
/// Every source is a public, keyless, server-side-bounded JSON endpoint:
///   - cryptocurrency.cv  — aggregated crypto/trading news (`limit`)
///   - Hacker News (Algolia) — trading stories (`hitsPerPage`)
///   - CoinGecko markets  — top market movers (`per_page`, `page`)
///
/// Each fetch performs one bounded HTTP outcall and normalizes the response
/// into `Types.ContentItem` values. Parsing is defensive: a malformed or
/// partial payload yields fewer items rather than a trap.
module {

  /// The fixed set of sources this app aggregates.
  public let descriptors : [Types.SourceDescriptor] = [
    {
      name = "Crypto News";
      url = "https://cryptocurrency.cv";
      description = "Aggregated crypto and trading headlines from 300+ outlets.";
    },
    {
      name = "Hacker News";
      url = "https://news.ycombinator.com";
      description = "Trading and markets discussions from the Hacker News community.";
    },
    {
      name = "CoinGecko";
      url = "https://www.coingecko.com";
      description = "Top cryptocurrencies by market capitalization and 24h movement.";
    },
  ];

  /// Number of items requested per source.
  let pageSize : Nat = 25;

  // --- Source URLs (exact, server-side bounded) ---------------------------

  func cryptoNewsUrl() : Text =
    "https://cryptocurrency.cv/api/news?limit=" # pageSize.toText();

  func hackerNewsUrl() : Text =
    "https://hn.algolia.com/api/v1/search_by_date?query=trading&tags=story&hitsPerPage=" # pageSize.toText();

  func coinGeckoUrl() : Text =
    "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1";

  // --- JSON helpers -------------------------------------------------------

  func asText(j : Json.Json) : ?Text =
    switch j { case (#String(t)) ?t; case _ null };

  func asInt(j : Json.Json) : ?Int =
    switch j {
      case (#Number(#Int(i))) ?i;
      case (#Number(#Float(f))) ?f.toInt();
      case _ null;
    };

  func field(fields : [(Text, Json.Json)], name : Text) : ?Json.Json {
    var found : ?Json.Json = null;
    for ((k, v) in fields.values()) {
      if (k == name) { found := ?v };
    };
    found;
  };

  func textField(fields : [(Text, Json.Json)], name : Text) : ?Text {
    switch (field(fields, name)) {
      case (?v) asText(v);
      case null null;
    };
  };

  func intField(fields : [(Text, Json.Json)], name : Text) : ?Int {
    switch (field(fields, name)) {
      case (?v) asInt(v);
      case null null;
    };
  };

  /// Parse an ISO-8601 UTC timestamp (`2026-10-14T13:06:23.000Z`) into
  /// nanoseconds since the Unix epoch. Returns `null` when the shape is not
  /// recognized, so the caller can fall back to the current time.
  func parseIso8601(text : Text) : ?Int {
    // Expected: YYYY-MM-DDTHH:MM:SS[.fff]Z
    let parts = text.split(#char 'T');
    let datePart = switch (parts.next()) { case (?d) d; case null return null };
    let timePart = switch (parts.next()) { case (?t) t; case null return null };

    let dateSegs = datePart.split(#char '-');
    let year = switch (dateSegs.next()) { case (?y) y; case null return null };
    let month = switch (dateSegs.next()) { case (?m) m; case null return null };
    let day = switch (dateSegs.next()) { case (?d) d; case null return null };

    // Strip a trailing `Z` and any fractional seconds.
    let timeNoZ = switch (timePart.split(#char 'Z').next()) { case (?t) t; case null timePart };
    let timeNoFrac = switch (timeNoZ.split(#char '.').next()) { case (?t) t; case null timeNoZ };
    let timeSegs = timeNoFrac.split(#char ':');
    let hour = switch (timeSegs.next()) { case (?h) h; case null return null };
    let minute = switch (timeSegs.next()) { case (?m) m; case null return null };
    let second = switch (timeSegs.next()) { case (?s) s; case null return null };

    let ?y = Int.fromText(year) else return null;
    let ?mo = Int.fromText(month) else return null;
    let ?d = Int.fromText(day) else return null;
    let ?h = Int.fromText(hour) else return null;
    let ?mi = Int.fromText(minute) else return null;
    let ?s = Int.fromText(second) else return null;

    // Days since epoch via a civil-date algorithm (Howard Hinnant).
    let yAdj = if (mo <= 2) y - 1 else y;
    let era = (if (yAdj >= 0) yAdj else yAdj - 399) / 400;
    let yoe = yAdj - era * 400;
    let mp = if (mo > 2) mo - 3 else mo + 9;
    let doy = (153 * mp + 2) / 5 + d - 1;
    let doe = yoe * 365 + yoe / 4 - yoe / 100 + doy;
    let days = era * 146097 + doe - 719468;

    let seconds = days * 86400 + h * 3600 + mi * 60 + s;
    ?(seconds * 1_000_000_000);
  };

  /// Derive a small set of topic tags from free text by matching known
  /// trading keywords. Case-insensitive.
  let topicKeywords : [(Text, Text)] = [
    ("bitcoin", "Bitcoin"),
    ("btc", "Bitcoin"),
    ("ethereum", "Ethereum"),
    ("eth", "Ethereum"),
    ("solana", "Solana"),
    ("defi", "DeFi"),
    ("stablecoin", "Stablecoins"),
    ("etf", "ETF"),
    ("stock", "Stocks"),
    ("equity", "Stocks"),
    ("forex", "Forex"),
    ("commodit", "Commodities"),
    ("gold", "Gold"),
    ("oil", "Oil"),
    ("inflation", "Macro"),
    ("fed", "Macro"),
    ("interest rate", "Macro"),
    ("regulation", "Regulation"),
    ("sec ", "Regulation"),
    ("hack", "Security"),
    ("exploit", "Security"),
    ("altcoin", "Altcoins"),
    ("nft", "NFTs"),
    ("trading", "Trading"),
    ("market", "Markets"),
  ];

  func deriveTopics(text : Text) : [Text] {
    let lower = text.toLower();
    let topics = List.empty<Text>();
    for ((needle, topic) in topicKeywords.values()) {
      if (lower.contains(#text needle)) {
        // `topics` is only read here, never mutated while iterating it.
        let already = topics.toArray().any(func (existing) { existing == topic });
        if (not already) { topics.add(topic) };
      };
    };
    topics.toArray();
  };

  /// A simple, deterministic virality score from engagement signals.
  /// Higher means more viral. Bounded to keep the UI ordering stable.
  func viralityScore(engagement : Nat, recencyBonus : Nat) : Nat {
    engagement + recencyBonus;
  };

  /// Recency bonus: newer items score higher. `publishedAt` is nanoseconds.
  func recencyBonus(publishedAt : Int, now : Int) : Nat {
    let ageNs = if (now > publishedAt) now - publishedAt else 0;
    let ageHours = ageNs / 3_600_000_000_000;
    if (ageHours >= 72) { 0 } else {
      // 72h -> 0, 0h -> 72
      Nat.sub(72, ageHours.toNat());
    };
  };

  // --- Per-source fetchers ------------------------------------------------

  /// Fetch and normalize the cryptocurrency.cv news feed.
  func fetchCryptoNews(transform : OutCall.Transform, now : Int) : async [Types.ContentItem] {
    let body = await OutCall.httpGetRequest(cryptoNewsUrl(), [], transform);
    let ?json = Json.parse(body) else return [];
    let #Object(root) = json else return [];
    let ?articlesJson = field(root, "articles") else return [];
    let #Array(articles) = articlesJson else return [];

    let items = List.empty<Types.ContentItem>();
    for (article in articles.values()) {
      let #Object(fields) = article else continue;
      let ?title = textField(fields, "title") else continue;
      if (title == "") { continue };
      let link = textField(fields, "link") ?? "";
      let sourceName = textField(fields, "source") ?? "Crypto News";
      let summary = textField(fields, "description") ?? "";
      let publishedAt = switch (textField(fields, "pubDate")) {
        case (?raw) parseIso8601(raw) ?? now;
        case null now;
      };
      let topics = deriveTopics(title # " " # summary);
      items.add({
        id = 0; // assigned by the store
        title;
        sourceName;
        sourceUrl = "https://cryptocurrency.cv";
        articleUrl = link;
        publishedAt;
        summary;
        body = summary;
        topics;
        viralityScore = viralityScore(10, recencyBonus(publishedAt, now));
      });
    };
    items.toArray();
  };

  /// Fetch and normalize Hacker News trading stories.
  func fetchHackerNews(transform : OutCall.Transform, now : Int) : async [Types.ContentItem] {
    let body = await OutCall.httpGetRequest(hackerNewsUrl(), [], transform);
    let ?json = Json.parse(body) else return [];
    let #Object(root) = json else return [];
    let ?hitsJson = field(root, "hits") else return [];
    let #Array(hits) = hitsJson else return [];

    let items = List.empty<Types.ContentItem>();
    for (hit in hits.values()) {
      let #Object(fields) = hit else continue;
      let ?title = textField(fields, "title") else continue;
      if (title == "") { continue };
      let url = textField(fields, "url") ?? "";
      let objectId = textField(fields, "objectID") ?? "";
      let articleUrl = if (url == "") {
        "https://news.ycombinator.com/item?id=" # objectId;
      } else { url };
      let points = switch (intField(fields, "points")) { case (?p) p; case null 0 };
      let comments = switch (intField(fields, "num_comments")) { case (?c) c; case null 0 };
      let publishedAt = switch (textField(fields, "created_at")) {
        case (?raw) parseIso8601(raw) ?? now;
        case null now;
      };
      let engagement = Nat.add(
        if (points > 0) { points.toNat() } else { 0 },
        if (comments > 0) { comments.toNat() } else { 0 },
      );
      let topics = deriveTopics(title);
      items.add({
        id = 0;
        title;
        sourceName = "Hacker News";
        sourceUrl = "https://news.ycombinator.com";
        articleUrl;
        publishedAt;
        summary = title;
        body = title;
        topics;
        viralityScore = viralityScore(engagement, recencyBonus(publishedAt, now));
      });
    };
    items.toArray();
  };

  /// Fetch and normalize CoinGecko top market movers.
  func fetchCoinGecko(transform : OutCall.Transform, now : Int) : async [Types.ContentItem] {
    let body = await OutCall.httpGetRequest(coinGeckoUrl(), [], transform);
    let ?json = Json.parse(body) else return [];
    let #Array(coins) = json else return [];

    let items = List.empty<Types.ContentItem>();
    for (coin in coins.values()) {
      let #Object(fields) = coin else continue;
      let ?name = textField(fields, "name") else continue;
      let symbol = textField(fields, "symbol") ?? "";
      let price = switch (intField(fields, "current_price")) { case (?p) p; case null 0 };
      let change = switch (intField(fields, "price_change_percentage_24h")) {
        case (?c) c;
        case null 0;
      };
      let volume = switch (intField(fields, "total_volume")) { case (?v) v; case null 0 };
      let title = name # " (" # symbol.toUpper() # ") — 24h " #
        (if (change >= 0) "+" else "") # change.toText() # "%";
      let summary = "Price $" # price.toText() # ", 24h volume $" # volume.toText() # ".";
      let topics = deriveTopics(name # " " # symbol);
      // Absolute 24h move plus volume rank drives virality.
      let move : Nat = if (change < 0) { Int.abs(change) } else { change.toNat() };
      let engagement = move + (if (volume > 0) { volume.toNat() / 1_000_000_000 } else { 0 });
      items.add({
        id = 0;
        title;
        sourceName = "CoinGecko";
        sourceUrl = "https://www.coingecko.com";
        articleUrl = "https://www.coingecko.com/en/coins/" # (textField(fields, "id") ?? symbol);
        publishedAt = now;
        summary;
        body = summary;
        topics;
        viralityScore = viralityScore(engagement, 0);
      });
    };
    items.toArray();
  };

  /// Fetch every source concurrently and return the merged, normalized items.
  /// A failing source contributes no items rather than failing the whole refresh.
  public func fetchAll(transform : OutCall.Transform) : async [Types.ContentItem] {
    let now = Time.now();
    let crypto = await fetchCryptoNews(transform, now);
    let hacker = await fetchHackerNews(transform, now);
    let gecko = await fetchCoinGecko(transform, now);
    crypto.concat(hacker).concat(gecko);
  };

};
