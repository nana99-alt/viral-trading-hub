import Entity "mo:caffeineai-oql/Entity";
import MapEntity "mo:caffeineai-oql/MapEntity";
import TextValue "mo:caffeineai-oql/TextValue";
import NatValue "mo:caffeineai-oql/NatValue";
import IntValue "mo:caffeineai-oql/IntValue";
import Map "mo:core/Map";
import Text "mo:core/Text";
import Types "../types/content";

/// OQL adapter for the persisted content collection.
///
/// `ContentItem` carries a `topics : [Text]` collection field, so it cannot be
/// auto-derived; this adapter uses manual mode and projects `topics` to a
/// single comma-joined text column. The entity is controller-only: the content
/// is a shared public aggregation, and the Data Intelligence agent reads it as
/// the controller.
module {
  public func entity(store : Map.Map<Nat, Types.ContentItem>) : Entity.Decl {
    store.toEntityManual("content", "ContentItem", "id")
      .sample({
        id = 0;
        title = "";
        sourceName = "";
        sourceUrl = "";
        articleUrl = "";
        publishedAt = 0;
        summary = "";
        body = "";
        topics = [];
        viralityScore = 0;
      })
      .payload("id", func item = item.id)
      .payload("title", func item = item.title)
      .payload("sourceName", func item = item.sourceName)
      .payload("sourceUrl", func item = item.sourceUrl)
      .payload("articleUrl", func item = item.articleUrl)
      .payload("publishedAt", func item = item.publishedAt)
      .payload("summary", func item = item.summary)
      .payload("body", func item = item.body)
      .payload("topics", func item = item.topics.values().join(", "))
      .payload("viralityScore", func item = item.viralityScore)
      .controllerOnly()
      .build();
  };
};
