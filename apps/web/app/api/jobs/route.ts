import { createJobSchema, searchJobsSchema } from "@acme/validators";
import { JobService } from "@/server/services/job.service";
import { parseJson, parseSearchParams } from "@/server/http/route-helpers";
import { protectClient } from "@/server/http/protect";
import { jsonOk, withApiHandler } from "@/server/http/api-response";

const jobService = new JobService();

export async function GET(request: Request) {
  return withApiHandler(async () => {
    const url = new URL(request.url);
    const parsed = parseSearchParams(url, searchJobsSchema);
    if (!parsed.ok) return parsed.response;
    const data = await jobService.listOpenJobs(parsed.data);
    return jsonOk(data);
  });
}

export async function POST(request: Request) {
  return withApiHandler(async () => {
    const gate = await protectClient(request);
    if (!gate.ok) return gate.response;
    const parsed = await parseJson(request, createJobSchema);
    if (!parsed.ok) return parsed.response;
    const data = await jobService.createDraftJob(gate.actor, parsed.data);
    return jsonOk(data, 201);
  });
}
