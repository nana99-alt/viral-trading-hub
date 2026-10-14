import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Map "mo:core/Map";
import Text "mo:core/Text";
import OutCall "mo:caffeineai-http-outcalls/outcall";
import Common "../types/common";
import Types "../types/content";
import Sources "../sources";

/// Domain logic for the aggregated viral trading content store.
///
/// State is owned by the actor and injected here: a `Map` of stored items and
/// a mutable id counter. All functions are pure over that state except
/// `refreshContent`, which performs the HTTP outcalls.
module {

  /// The persistent collection of aggregated content items, keyed by id.
  public type ContentStore = Map.Map<Common.ContentId, Types.ContentItem>;

  /// Mutable id counter shared with the actor.
  public type IdCounter = { var next : Nat };

  /// Case-insensitive keyword match against an item's title and topics.
  func matchesKeyword(item : Types.ContentItem, keyword : Text) : Bool {
    let needle = keyword.toLower();
    if (needle == "") { return true };
    if (item.title.toLower().contains(#text needle)) { return true };
    for (topic in item.topics.values()) {
      if (topic.toLower().contains(#text needle)) { return true };
    };
    false;
  };

  /// Whether an item falls inside the optional inclusive time range.
  func inTimeRange(item : Types.ContentItem, range : ?Common.TimeRange) : Bool {
    switch (range) {
      case null true;
      case (?r) {
        let afterFrom = switch (r.from) {
          case (?from) item.publishedAt >= from;
          case null true;
        };
        let beforeTo = switch (r.to) {
          case (?to) item.publishedAt <= to;
          case null true;
        };
        afterFrom and beforeTo;
      };
    };
  };

  /// List viral content matching the optional filters, sorted by virality
  /// score descending (ties broken by newest first).
  public func listViralContent(
    store : ContentStore,
    filter : Types.ContentFilter,
  ) : [Types.ContentItem] {
    let matched = store.values().filter(func item {
      let keywordOk = switch (filter.keyword) {
        case (?k) matchesKeyword(item, k);
        case null true;
      };
      let sourceOk = switch (filter.source) {
        case (?s) item.sourceName == s;
        case null true;
      };
      keywordOk and sourceOk and inTimeRange(item, filter.timeRange);
    }).toArray();

    matched.sort(func (a, b) {
      if (a.viralityScore > b.viralityScore) { #less }
      else if (a.viralityScore < b.viralityScore) { #greater }
      else if (a.publishedAt > b.publishedAt) { #less }
      else if (a.publishedAt < b.publishedAt) { #greater }
      else { #equal };
    });
  };

  /// Fetch a single content item by id.
  public func getContent(store : ContentStore, id : Common.ContentId) : ?Types.ContentItem {
    store.get(id);
  };

  /// Fetch content related to the given item by shared topics, excluding the
  /// item itself, sorted by virality score descending.
  public func getRelatedContent(store : ContentStore, id : Common.ContentId) : [Types.ContentItem] {
    let ?target = store.get(id) else return [];
    if (target.topics.size() == 0) { return [] };

    let related = store.values().filter(func item {
      if (item.id == id) { return false };
      item.topics.any(func (topic) {
        target.topics.any(func (t) { t == topic });
      });
    }).toArray();

    related.sort(func (a, b) {
      if (a.viralityScore > b.viralityScore) { #less }
      else if (a.viralityScore < b.viralityScore) { #greater }
      else { #equal };
    });
  };

  /// List the available external content sources.
  public func listSources() : [Types.SourceDescriptor] {
    Sources.descriptors;
  };

  /// Stable identity for an item, used to avoid storing duplicates across
  /// refreshes. Prefers the article URL, falling back to source + title.
  func dedupeKey(item : Types.ContentItem) : Text {
    if (item.articleUrl != "") {
      item.articleUrl;
    } else {
      item.sourceName # "|" # item.title;
    };
  };

  /// Pull fresh content from the external sources and merge it into the store
  /// without duplicating existing items. Returns the number of new items added.
  public func refreshContent(
    store : ContentStore,
    counter : IdCounter,
    transform : OutCall.Transform,
  ) : async Nat {
    let fetched = await Sources.fetchAll(transform);

    // Index existing items by dedupe key.
    let existing = Map.empty<Text, Bool>();
    for (item in store.values()) {
      existing.add(dedupeKey(item), true);
    };

    var added = 0;
    for (item in fetched.values()) {
      let key = dedupeKey(item);
      if (existing.get(key) == null) {
        let id = counter.next;
        counter.next := id + 1;
        store.add(id, { item with id });
        existing.add(key, true);
        added += 1;
      };
    };
    added;
  };

};
