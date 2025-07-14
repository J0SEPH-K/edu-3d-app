/* global gifWorker */

import React, { useEffect, useRef, useState } from "react";
import * as $3Dmol from "3dmol";


const ChemistryViewer = ({ formula }) => {
  const viewerRef = useRef(null);
  const [cid, setCid] = useState(null);
  const gifWorker = process.env.PUBLIC_URL + "/gif.worker.js";

useEffect(() => {
  if (!formula) return;

  const timeout = setTimeout(async () => {
    let foundCid = null;

    try {
      // 1️⃣ Direct name search
      const nameRes = await fetch(
        `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(formula)}/cids/JSON`
      );
      if (nameRes.ok) {
        const nameData = await nameRes.json();
        foundCid = nameData?.IdentifierList?.CID?.[0];
      }
    } catch {}

    try {
      // 2️⃣ Autocomplete search fallback
      if (!foundCid) {
        const autoRes = await fetch(
          `https://pubchem.ncbi.nlm.nih.gov/rest/autocomplete/compound/${encodeURIComponent(formula)}/JSON?limit=1`
        );
        if (autoRes.ok) {
          const autoData = await autoRes.json();
          const suggestion = autoData?.dictionary_terms?.compound?.[0];
          if (suggestion) {
            const res = await fetch(
              `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(suggestion)}/cids/JSON`
            );
            if (res.ok) {
              const data = await res.json();
              foundCid = data?.IdentifierList?.CID?.[0];
            }
          }
        }
      }
    } catch {}

    try {
      // 3️⃣ Formula fallback search
      if (!foundCid) {
        const resFormula = await fetch(
          `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/formula/${encodeURIComponent(formula)}/cids/JSON?list_return=flat`
        );
        if (resFormula.ok) {
          const dataFormula = await resFormula.json();
          foundCid = dataFormula?.IdentifierList?.CID?.[0];
        }
      }
    } catch {}

    setCid(foundCid ?? "INVALID");
  }, 500);

  return () => clearTimeout(timeout);
}, [formula]);






  useEffect(() => {
  if (!cid || cid === "INVALID") return;
  if (!viewerRef.current) return;

  if (viewerRef.current.spinFrame) {
    cancelAnimationFrame(viewerRef.current.spinFrame);
    }

  viewerRef.current.innerHTML = "";

  // 💥 clear all WebGL contexts to avoid stacking
  if (viewerRef.current.viewer) {
    viewerRef.current.viewer.clear();
    viewerRef.current.viewer = null;
  }

  const viewer = $3Dmol.createViewer(viewerRef.current, {
    backgroundColor: "white",
    defaultcolors: $3Dmol.rasmolElementColors,
  });

  viewerRef.current.viewer = viewer; // store reference

  $3Dmol.download(`cid:${cid}`, viewer, {}, function () {
  viewer.setStyle({}, { stick: {}, sphere: { scale: 0.3 } });
  viewer.zoomTo();
  viewer.render();
  let angle = 0;

    function rotate() {
        viewer.rotate(0.5); // 1 degree around Y axis
        viewer.render();
        viewerRef.current.spinFrame = requestAnimationFrame(rotate);
    }
rotate();
  viewer.resize();

  const canvas = viewerRef.current.querySelector("canvas");
  if (canvas) {
    canvas.style.position = "absolute";
    canvas.style.top = 0;
    canvas.style.left = 0;
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.display = "block";
  }
});

}, [cid]);


  return (
  <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
    <div style={{ width: "600px", minHeight: "400px" }}>
      {cid === "INVALID" && formula && (
        <div
          style={{
            color: "red",
            marginBottom: "0.5rem",
            textAlign: "center",
          }}
        >
          ❌ Invalid chemical formula
        </div>
      )}
      <div
        ref={viewerRef}
        style={{
          width: "100%",
          height: "400px",
          maxWidth: "600px",
          border: "1px solid #ccc",
          backgroundColor: "#fff",
          overflow: "hidden",
          position: "relative",
        }}
      />
      <button
        onClick={() => {
          const viewer = viewerRef.current.viewer;
          if (!viewer) return;
          const canvas = viewerRef.current.querySelector("canvas");
          if (!canvas) return;

          const gif = new window.GIF({
            workers: 2,
            quality: 10,
            width: canvas.width,
            height: canvas.height,
            workerScript: gifWorker,
          });




          let frames = 0;

          const capture = () => {
          const totalFrames = 120;
          const dropFrames = 20;
          const degreesPerFrame = 360 / totalFrames;
          let frame = 0;

          const capture = () => {
            if (frame >= totalFrames - dropFrames) {
              gif.on("finished", (blob) => {
                const a = document.createElement("a");
                a.href = URL.createObjectURL(blob);
                a.download = `${formula || "molecule"}.gif`;
                a.click();
              });
              gif.render();
              return;
            }

            gif.addFrame(canvas, { copy: true, delay: 30 });
            viewer.rotate(degreesPerFrame);
            viewer.render();

            frame++;
            requestAnimationFrame(capture);
          };

          capture();


          };
          capture();
        }}
        style={{
          marginTop: "10px",
          width: "100%",
          padding: "0.5rem",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        Save as GIF
      </button>
    </div>
  </div>
);

};

export default ChemistryViewer;
