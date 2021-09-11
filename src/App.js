import { useEffect, useState } from "react";
import { CSVReader } from "react-papaparse";
import { Line } from "react-chartjs-2";
import "./App.css";
import Tree from "@naisutech/react-tree";

function App() {
  const [dataCSV, setDataCSV] = useState();
  const [isFile, setIsFile] = useState(false);
  const [result, setResult] = useState([]);
  const [resultTree, setResultTree] = useState([]);
  const [allDatas, setAllDatas] = useState([]);
  const [currentElem, setCurrentElem] = useState([]);
  const [dates, setDates] = useState([]);

  function sumSells(arr) {
    const result = arr.reduce((acc, x) => {
      const index = acc.findIndex((y) => y.date === x.date);

      if (index >= 0) {
        acc[index].children.push({ ventes: x.ventes });
      } else {
        acc = [
          ...acc,
          {
            date: x.date,
            children: [
              {
                ventes: x.ventes,
              },
            ],
          },
        ];
      }
      return acc;
    }, []);

    let realSell = [];
    for (let i = 0; i < result.length; i++) {
      result[i].total = result[i].children.reduce(
        (total, obj) => parseInt(obj.ventes, 10) + total,
        0
      );
      realSell.push(result[i].total);
    }
    return realSell;
  }

  const graphData = {
    labels: dates,
    datasets: [
      {
        label: currentElem.length > 0 ? currentElem[0].label : "",
        data: currentElem.length > 0 ? sumSells(currentElem[0].sell) : [],
        fill: false,
        borderColor: "rgb(0, 0, 255)",
      },
    ],
  };

  const graphOptions = {
    scales: {
      yAxes: [
        {
          ticks: {
            beginAtZero: false,
          },
        },
      ],
    },
  };

  function handleOnDrop(data) {
    setDataCSV(data);
    setIsFile(true);
  }

  function containsObj(obj, arr) {
    for (let i = 0; i < arr.length; i++) {
      if (arr[i] === obj) {
        return true;
      }
    }
    return false;
  }

  function handleOnError(err, file, inputElt, reason) {
    console.log(err);
  }

  function handleOnRemove(data) {
    setIsFile(false);
  }

  function findSelectedNode(selected, arr) {
    let node = arr.filter((elt) => elt.id === selected[0]);
    setCurrentElem(node);
  }

  function displayData() {
    let res = [];

    for (let i = 0; i < dataCSV.length; i++) {
      res.push(dataCSV[i].data);
    }
    setResult(res);
  }

  useEffect(() => {
    function generateTree(data) {
      let level1 = [];
      let level1Obj = [];
      let level2 = [];
      let splitData = [];
      let dates = [];
      let allDatas = [];

      for (let i = 0; i < data.length; i++) {
        if (!dates.includes(data[i].date)) {
          dates.push(data[i].date);
        }
      }
      setDates(dates);

      if (data && data.length > 0) {
        for (let i = 0; i < data.length; i++) {
          if (!level1.includes(data[i].niveau_1)) {
            level1.push(data[i].niveau_1);
            level1Obj.push({
              id: data[i].niveau_1,
              label: data[i].niveau_1,
              parentId: null,
              items: [],
              sell: [],
            });
          }
          for (let j = 0; j < level1Obj.length; j++) {
            if (data[i].niveau_1 === level1Obj[j].id) {
              level1Obj[j].sell.push({
                date: data[i].date,
                ventes: data[i].ventes,
              });
            }
          }
        }

        for (let i = 0; i < data.length; i++) {
          if (
            false ===
            containsObj(
              {
                id: `${data[i].niveau_2}-${data[i].niveau_1}`,
                label: data[i].niveau_2,
                parentId: data[i].niveau_1,
                sell: [],
                items: [],
              },
              level1Obj
            )
          ) {
            level2.push(data[i].niveau_2);
            level1Obj.push({
              id: `${data[i].niveau_2}-${data[i].niveau_1}`,
              label: data[i].niveau_2,
              parentId: data[i].niveau_1,
              sell: [],
              items: [],
            });
          }
          for (let j = 0; j < level1Obj.length; j++) {
            if (`${data[i].niveau_2}-${data[i].niveau_1}` === level1Obj[j].id) {
              level1Obj[j].sell.push({
                date: data[i].date,
                ventes: data[i].ventes,
              });
            }
          }
        }

        allDatas.push(...level1Obj);

        for (let i = 0; i < data.length; i++) {
          if (
            false ===
            containsObj(
              {
                id: `${data[i].niveau_3}-${data[i].niveau_2}-${data[i].niveau_1}`,
                label: data[i].niveau_3,
                parentId: `${data[i].niveau_2}-${data[i].niveau_1}`,
                sell: [],
              },
              splitData
            )
          ) {
            splitData.push({
              id: `${data[i].niveau_3}-${data[i].niveau_2}-${data[i].niveau_1}`,
              label: data[i].niveau_3,
              parentId: `${data[i].niveau_2}-${data[i].niveau_1}`,
              sell: [],
            });
          }
          for (let j = 0; j < splitData.length; j++) {
            if (
              `${data[i].niveau_3}-${data[i].niveau_2}-${data[i].niveau_1}` ===
              splitData[j].id
            ) {
              splitData[j].sell.push({
                date: data[i].date,
                ventes: data[i].ventes,
              });
            }
          }
        }

        splitData = splitData.filter(
          (elem, ind) =>
            ind ===
            splitData.findIndex(
              (elt) =>
                elt.id === elem.id &&
                elt.parentId === elem.parentId &&
                elt.date === elem.date &&
                elt.ventes === elem.ventes
            )
        );

        let filteredSplitData = splitData.filter(
          (elem, ind) =>
            ind ===
            splitData.findIndex(
              (elt) => elt.id === elem.id && elt.parentId === elem.parentId
            )
        );

        for (let i = 0; i < filteredSplitData.length; i++) {
          for (let j = 0; j < level1Obj.length; j++) {
            if (level1Obj[j].id === filteredSplitData[i].parentId) {
              level1Obj[j].items.push(filteredSplitData[i]);
            }
          }
        }

        allDatas.push(...splitData);

        setAllDatas(allDatas);

        level1Obj = level1Obj.filter(
          (elem, ind) =>
            ind ===
            level1Obj.findIndex(
              (elt) => elt.id === elem.id && elt.parentId === elem.parentId
            )
        );

        allDatas = allDatas.filter(
          (elem, ind) =>
            ind ===
            allDatas.findIndex(
              (elt) =>
                elt.id === elem.id &&
                elt.label === elem.label &&
                elt.parentId === elem.parentId
            )
        );
      }
      setResultTree(level1Obj);
    }

    generateTree(result);
  }, [result]);

  useEffect(() => {
    if (currentElem.length > 0) {
      sumSells(currentElem[0].sell);
    }
  }, [currentElem]);

  return (
    <div className="App">
      <h1>Data CSV Reader</h1>
      <CSVReader
        config={{ header: true, skipEmptyLines: true }}
        onDrop={(data) => handleOnDrop(data)}
        onError={() => handleOnError()}
        onRemoveFile={(data) => handleOnRemove(data)}
        className="csv-reader"
      >
        <span>Drop CSV file here or click to upload</span>
      </CSVReader>
      {isFile ? (
        <button onClick={() => displayData()}>Display Results</button>
      ) : null}
      {resultTree.length > 0 && (
        <div className="hierarchy-graphic">
          <div className="hierarchy">
            <Tree
              nodes={resultTree}
              onSelect={(selectedNode) => {
                findSelectedNode(selectedNode, allDatas);
              }}
            />
          </div>

          <div className="graphic">
            <Line data={graphData} options={graphOptions} />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
