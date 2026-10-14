module {
  /// Unique identifier for an aggregated content item.
  public type ContentId = Nat;

  /// Publication timestamp in nanoseconds since the Unix epoch (signed Int).
  public type Timestamp = Int;

  /// A time-range filter expressed as optional inclusive bounds in nanoseconds.
  public type TimeRange = {
    from : ?Timestamp;
    to : ?Timestamp;
  };
};
