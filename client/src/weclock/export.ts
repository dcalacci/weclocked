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
  fileNames: string[];
  notes: string; // text notes on this export

  //TODO: Expand as we need additional context or information from exports
  constructor(files: File[] = []) {
    this.identifier = createUniqueId();
    this.files = files;
    this.fileNames = files.map((f) => f.name);
    this.notes = "";
  }


  // returns a new weclock export from a well-formatted json export
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
