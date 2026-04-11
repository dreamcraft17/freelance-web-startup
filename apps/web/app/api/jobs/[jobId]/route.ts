import { updateJobSchema } from "@acme/validators";
import { JobService } from "@/server/services/job.service";
import { parseJson } from "@/server/http/route-helpers";
import { protectClient } from "@/server/http/protect";
import { jsonFail, jsonOk, withApiHandler } from "@/server/http/api-response";

const jobService = new JobService();

type RouteContext = { params: Promise<{ jobId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  return withApiHandler(async () => {
    const params = await context.params;
    const jobId = params.jobId?.trim();
    if (!jobId) return jsonFail("Invalid job id", 400, "INVALID_ID");
    const data = await jobService.getJobByIdForPublic(jobId);
    if (!data) return jsonFail("Job not found", 404, "NOT_FOUND");
    return jsonOk(data);
  });
}

export async function PATCH(request: Request, context: RouteContext) {
  return withApiHandler(async () => {
    const gate = await protectClient(request);
    if (!gate.ok) return gate.response;
    const params = await context.params;
    const jobId = params.jobId?.trim();
    if (!jobId) return jsonFail("Invalid job id", 400, "INVALID_ID");
    const parsed = await parseJson(request, updateJobSchema);
    if (!parsed.ok) return parsed.response;
    const data = await jobService.updateJob(gate.actor, jobId, parsed.data);
    return jsonOk(data);
  });
}
