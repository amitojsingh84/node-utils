export class APError extends Error {

  constructor(name : string, message : string) {
    super(name)

    this.name    = name
    this.message = message
  }
}