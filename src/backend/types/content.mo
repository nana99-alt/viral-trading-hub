import Common "../types/common";

module {
  public type ContentId = Common.ContentId;
  public type Timestamp = Common.Timestamp;
  public type TimeRange = Common.TimeRange;

  /// A single aggregated trading content item.
  public type ContentItem = {
    id : ContentId;
    title : Text;
    sourceName : Text;
    sourceUrl : Text;
    articleUrl : Text;
    publishedAt : Timestamp;
    summary : Text;
    body : Text;
    topics : [Text];
    viralityScore : Nat;
  };

  /// A descriptor for one external content source.
  public type SourceDescriptor = {
    name : Text;
    url : Text;
    description : Text;
  };

  /// Optional filters applied when listing viral content.
  public type ContentFilter = {
    keyword : ?Text;
    source : ?Text;
    timeRange : ?TimeRange;
  };
};
