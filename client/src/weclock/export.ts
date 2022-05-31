import { createUniqueId } from "solid-js";

// interface for JSON serialization of weclock export
export interface JSONWeClockExport {
  blobs: Blob[];
  notes: string;
  identifier: string;
  fileNames: string[];
}

export type Point = { lat: number; lng: number; datetime?: string };

export type Stop = {
  datetime: string;
  leaving_datetime: string;
  lat: number;
  lng: number;
  type: string;
  clusterID: number;
};

export type Cluster = {
  id: number;
  identifier: string;
  centroid: Point;
  label: string;
  avgDist: number;
  nStops: number;
  totalTime: number
  timesInCluster: Date[][]
}

export type Stops = {
  identifier: string;
  avgLoc: Point;
  records: Stop[];
};

export type Locs = {
  identifier: string,
  records: Point[]
}

export type Clusters = {
  identifier: string,
  records: Cluster[]
}


export type UploadData = {
  wb_info: { url: string };
  upload: string;
  message: string;
  data: { clusters: Stops[], all_locations: Locs[] };
  avgLoc: Point;
};

//TODO: we're storing stops and locs separately for now
// represents a collection of file exports from a single WeClock user
export class WeClockExport {
  identifier: string; // identifier for this user/worker/etc
  files: File[]; // array of export files uploaded by the user
  notes: string; // text notes on this export
  locs: Point[];
  stops: Stop[];
  clusters: Cluster[];
  avgLoc: Point;

  //TODO: Expand as we need additional context or information from exports
  constructor(
    files: File[] = [],
    identifier: string = createUniqueId(),
    notes: string = "",
    locs?: Point[],
    stops?: Stop[],
    clusters?: Cluster[],
    avgLoc?: Point
  ) {
    this.identifier = identifier;
    this.files = files;
    this.notes = notes;
    this.locs = locs || [];
    this.stops = stops || [];
    this.clusters = clusters || [];
    this.avgLoc = avgLoc || { lat: 45, lng: -71 }
  }

  clone(obj: WeClockExport): WeClockExport {
    //TODO: stub
    return new WeClockExport(this.files, this.identifier, this.notes);
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
