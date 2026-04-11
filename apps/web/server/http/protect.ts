export {
  requireAuth,
  requireActiveAccount,
  requireRoles,
  protect,
  protectClient,
  protectFreelancer,
  protectClientOrFreelancer,
  protectStaff,
  protectAnyActiveUser,
  type ProtectResult,
  type ProtectOptions
} from "../../src/server/http/protect";
