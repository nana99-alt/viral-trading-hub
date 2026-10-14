import OutCall "mo:caffeineai-http-outcalls/outcall";
import Common "../types/common";
import Types "../types/content";
import ContentLib "../lib/content";

/// Public API for the viral trading content domain.
///
/// State and the HTTP transform callback are injected by the composition root
/// (`main.mo`), which owns the actor's stable fields.
mixin (
  store : ContentLib.ContentStore,
  counter : ContentLib.IdCounter,
  transform : OutCall.Transform,
) {

  /// List viral content matching the optional filters, sorted by virality
  /// score descending.
  public query func listViralContent(filter : Types.ContentFilter) : async [Types.ContentItem] {
    ContentLib.listViralContent(store, filter);
  };

  /// Fetch a single content item by id.
  public query func getContent(id : Common.ContentId) : async ?Types.ContentItem {
    ContentLib.getContent(store, id);
  };

  /// Fetch content related to the given item by shared topics.
  public query func getRelatedContent(id : Common.ContentId) : async [Types.ContentItem] {
    ContentLib.getRelatedContent(store, id);
  };

  /// List the available external content sources.
  public query func listSources() : async [Types.SourceDescriptor] {
    ContentLib.listSources();
  };

  /// Pull fresh content from the external sources and persist it.
  public shared func refreshContent() : async Nat {
    await ContentLib.refreshContent(store, counter, transform);
  };

};
