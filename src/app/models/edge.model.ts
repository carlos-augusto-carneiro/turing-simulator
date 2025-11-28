export class Edge {
  constructor(
    public read_c: string,
    public write_c: string,
    public direction: string
  ) {}

  getRead(): string { return this.read_c; }
  getWrite(): string { return this.write_c; }
  getDirection(): string { return this.direction; }

  static instance(read_c: string, write_c: string, direction: string): Edge {
    return new Edge(read_c, write_c, direction);
  }

  equals(edge: Edge): boolean {
    return (
      this.read_c === edge.getRead() &&
      this.write_c === edge.getWrite() &&
      this.direction === edge.getDirection()
    );
  }
}
