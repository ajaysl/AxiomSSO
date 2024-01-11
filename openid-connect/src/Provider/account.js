const store = new Map();
const logins = new Map();
import { nanoid } from "nanoid";

class Account {
  constructor(id, profile) {
    this.accountId = id || nanoid();
    this.profile = profile;
    store.set(this.accountId, this);
  }

  /**
   * @param use - can either be "id_token" or "userinfo", depending on
   *   where the specific claims are intended to be put in.
   * @param scope - the intended scope, while oidc-provider will mask
   *   claims depending on the scope automatically you might want to skip
   *   loading some claims from external resources etc. based on this detail
   *   or not return them in id tokens but only userinfo and so on.
   */
  async claims(use, scope, claims, reject) {
    // eslint-disable-line no-unused-vars

    if (this.profile) {
      return {
          userid: this.profile.userid,
          accountid: this.profile.accountid,
          username:this.profile.username,
          password:this.profile.password,
          phone:this.profile.phone,
          email:this.profile.email,
          status:this.profile.status,
          attempts:this.profile.attempts,
          groupid:this.profile.groupid,
          accesstill:this.profile.accesstill,
          accessfrom:this.profile.accessfrom,
          defaulttoken:this.profile.defaulttoken,
          createdon:this.profile.createdon,
          updatedon:this.profile.updatedon,
          lastlogindate:this.profile.lastlogindate,
          passwordupdatedOn:this.profile.passwordupdatedOn,
          multiDeviceStatus:this.profile.multiDeviceStatus,
          logincount:this.profile.logincount,
          lastinvalidattempton:this.profile.lastinvalidattempton,
          userimage:this.profile.userimage,
          userPatternPassword:this.profile.userPatternPassword,
          
        
      };
    }
    console.log(this.profile);

    return {
      sub: this.accountId, // it is essential to always return a sub claim
    };
  }

  static async findByFederated(provider, claims) {
    const id = `${provider}.${claims.sub}`;
    if (!logins.get(id)) {
      logins.set(id, new Account(id, claims));
    }
    return logins.get(id);
  }

  static async findByLogin(data) {
    const login = data.userId;
    if (!logins.get(login)) {
      logins.set(login, new Account(login, data));
    }

    return logins.get(login);
  }

  static async findAccount(ctx, id, token) {
    // eslint-disable-line no-unused-vars
    // token is a reference to the token used for which a given account is being loaded,
    //   it is undefined in scenarios where account claims are returned from authorization endpoint
    // ctx is the koa request context

    if (!store.get(id)) new Account(id); // eslint-disable-line no-new
    return store.get(id);
  }
}

export default Account;
