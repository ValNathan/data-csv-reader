export function convertToJSON(file) {
  let lines = file.split("\n");

  let result = [];

  let headers = lines[0].split(";");

  for (let i = 0; i < lines.length; i++) {
    let obj = {};
    let currentLine = lines[i].split(";");

    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = currentLine[j];
    }

    result.push(obj);
  }

  console.log(result);
  return result;
}
