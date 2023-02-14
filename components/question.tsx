import React, { useState } from "react";

export function Question() {
  const [data, setData] = useState(["hello", "hi there", "holla"]);

  const [showAll, setShowAll] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [showCurrent, setShowCurrent] = useState(false);

  const toggleAll = () => {
    setShowAll(val => !val);
    setShowCurrent(false);
  };

  const toggleCurrent = () => {
    if (!showCurrent) {
      setShowCurrent(true);
      setShowAll(false);
      return;
    }
  };

  const setCurrent = index => {
    setCurrentIdx(index);
    toggleCurrent();
  };

  return (
    <div>
      <div style={{ display: "flex" }}>
        <button onClick={toggleAll}>{showAll ? "Hide All" : "Show All"}</button>
        <button onClick={() => setCurrent(0)}>First</button>
        <button onClick={() => setCurrent(1)}>Second</button>
        <button onClick={() => setCurrent(2)}>Third</button>
      </div>
      <div>
        {showAll && data.map((el, i) => <p key={`content-${i}`}>{el}</p>)}
      </div>

      {showCurrent ? <div>{data[currentIdx]}</div> : null}
    </div>
  );
};