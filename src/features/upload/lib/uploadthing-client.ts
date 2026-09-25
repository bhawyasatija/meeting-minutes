// File: src/features/upload/lib/uploadthing-client.ts
// Purpose: a typed upload hook for the browser, generated from our own file router (file-router.ts)
// so the upload panel gets autocomplete and a type error if an endpoint name is misspelled.
// Only a TYPE is imported from the server file, so none of its server code ends up in the browser bundle.
import { generateReactHelpers } from "@uploadthing/react";
import type { MeetingFileRouter } from "../services/file-router";

export const { useUploadThing } = generateReactHelpers<MeetingFileRouter>();
