import { createUniqueId } from "solid-js";

// interface for JSON serialization of weclock export
export interface JSONWeClockExport {
  blobs: Blob[];
  notes: string;
  identifier: string;
  fileNames: string[];
}

// represents a collection of file exports from a single WeClock user
export class WeClockExport {
  identifier: string; // identifier for this user/worker/etc
  files: File[]; // array of export files uploaded by the user
  notes: string; // text notes on this export

  //TODO: Expand as we need additional context or information from exports
  constructor(files: File[] = [], identifier: string = createUniqueId()) {
    this.identifier = identifier;
    this.files = files;
    this.notes = "";
  }

  get fileNames(): string[] {
    return this.files.map((f) => f.name);
  }

  // returns a new weclock export from a well-formatted json
  static fromJSON(json: JSONWeClockExport): WeClockExport {
    let files = json.blobs.map((b, i) => new File([b], json.fileNames[i]));
    let wc = new WeClockExport(files);
    wc.identifier = json.identifier;
    wc.notes = json.notes;
    return wc;
  }

  // returns a json representation of this export
  toJSON(): JSONWeClockExport {
    let blobs = this.files.map((f) => new Blob([f]));
    let obj = {
      identifier: this.identifier,
      blobs,
      fileNames: this.fileNames,
      notes: this.notes,
    };
    console.log("Returning serializable export:", obj);
    return obj;
  }
}
