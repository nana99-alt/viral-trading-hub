import AccessControl "mo:caffeineai-authorization/access-control";
import MixinAuthorization "mo:caffeineai-authorization/MixinAuthorization";
import Expose "mo:caffeineai-oql/Expose";
import OutCall "mo:caffeineai-http-outcalls/outcall";
import ContentApi "mixins/content-api";
import ContentLib "lib/content";
import ContentOql "generated/ContentOql";
import ApiDocMixin "mixins/api-doc";

actor {
  let accessControlState : AccessControl.AccessControlState;
  let store : ContentLib.ContentStore;
  let counter : ContentLib.IdCounter;

  include MixinAuthorization(accessControlState, null);

  /// Response-normalization callback for HTTP outcalls. The actor owns this
  /// shared query member; the domain mixin receives it as a parameter.
  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  include ContentApi(store, counter, transform);
  include ApiDocMixin();
  include Expose({ entities = [ContentOql.entity(store)] });
};
