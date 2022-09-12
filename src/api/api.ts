import { ProjectHttp } from "@/utils/http";
import { Recordable } from "types";
import { adminUrl } from "./base-url";

export const covid = ()=> {
  return ProjectHttp.service(adminUrl, {
    url: "/covid",
    method: "get",
  });
}
