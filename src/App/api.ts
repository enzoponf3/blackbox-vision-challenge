import {Question} from "./types"

export default {
  list: (): Promise<Question[]> =>
    fetch("https://opentdb.com/api.php?amount=10")
      .then((res) => res.json())
      .then((res) => res.results),
}
