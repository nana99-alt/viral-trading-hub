import AccessControl "mo:caffeineai-authorization/access-control";
import Map "mo:core/Map";

module {
  public type OldActor = {};
  public type NewActor = {
    accessControlState : AccessControl.AccessControlState;
    store : Map.Map<Nat, {
      id : Nat;
      title : Text;
      sourceName : Text;
      sourceUrl : Text;
      articleUrl : Text;
      publishedAt : Int;
      summary : Text;
      body : Text;
      topics : [Text];
      viralityScore : Nat;
    }>;
    counter : { var next : Nat };
  };

  public func migration(_ : OldActor) : NewActor {
    {
      accessControlState = AccessControl.initState();
      store = Map.empty();
      counter = { var next = 0 };
    };
  };
};
