/* global gifWorker */

import React, { useEffect, useRef, useState } from "react";
import * as $3Dmol from "3dmol";

const ChemistryViewer = ({ formula }) => {
  const viewerRef = useRef(null);
  const [cid, setCid] = useState(null);
  const gifWorker = process.env.PUBLIC_URL + "/gif.worker.js";
  const [suggestion, setSuggestion] = useState(null);

  useEffect(() => {
    if (!formula) return;

    const timeout = setTimeout(async () => {
      let foundCid = null;
      console.log("Searching PubChem for:", formula);

      try {
        console.log("Trying name search...");
        const nameRes = await fetch(
          `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(
            formula
          )}/cids/JSON`
        );
        if (nameRes.ok) {
          if (nameRes.ok) {
            const nameData = await nameRes.json();
            foundCid = nameData?.IdentifierList?.CID?.[0];
            if (foundCid) console.log("Found by name:", foundCid);
          }

          if (foundCid) console.log("Found by name:", foundCid);
        }
      } catch (e) {
        console.error("Name search error:", e);
      }

      if (!foundCid) {
        try {
          console.log("Trying autocomplete...");
          const autoRes = await fetch(
            `https://pubchem.ncbi.nlm.nih.gov/rest/autocomplete/compound/${encodeURIComponent(
              formula
            )}/JSON?limit=1`
          );
          if (autoRes.ok) {
            const autoData = await autoRes.json();
            const suggestion = autoData?.dictionary_terms?.compound?.[0];
            if (suggestion) {
              console.log("Autocomplete suggestion:", suggestion);
              setSuggestion(suggestion);
              const res = await fetch(
                `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(
                  suggestion
                )}/cids/JSON`
              );
              if (res.ok) {
                const data = await res.json();
                foundCid = data?.IdentifierList?.CID?.[0];
                if (foundCid) console.log("Found by suggestion:", foundCid);
              }
            }
          }
        } catch (e) {
          console.error("Autocomplete error:", e);
        }
      }

      if (!foundCid) {
        try {
          console.log("Trying formula search...");
          const resFormula = await fetch(
            `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/formula/${encodeURIComponent(
              formula
            )}/cids/JSON?list_return=flat`
          );
          if (resFormula.ok) {
            const dataFormula = await resFormula.json();
            const cidList = dataFormula?.IdentifierList?.CID || [];
            console.log("Formula search CID list:", cidList);

            for (const cidCandidate of cidList) {
              try {
                const viewRes = await fetch(
                  `https://pubchem.ncbi.nlm.nih.gov/rest/pug_view/data/compound/${cidCandidate}/JSON`
                );
                if (viewRes.ok) {
                  const viewData = await viewRes.json();
                  const sections = viewData?.Record?.Section || [];

                  const has3D = sections.some((sec) =>
                    sec?.TOCHeading?.toLowerCase().includes("3d conformer")
                  );

                  if (has3D) {
                    foundCid = cidCandidate;
                    console.log("Found by formula with 3D:", foundCid);
                    break;
                  } else {
                    console.log("CID", cidCandidate, "has no 3D data");
                  }
                }
              } catch (e) {
                console.error("Error checking 3D data for", cidCandidate, e);
              }
            }
          }
        } catch (e) {
          console.error("Formula search error:", e);
        }
      }

      if (!foundCid) {
        console.warn("No CID found. Falling back...");
        setCid("FALLBACK");
      } else {
        console.log("Using CID:", foundCid);
        setCid(foundCid);
      }
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

    if (viewerRef.current.viewer) {
      viewerRef.current.viewer.clear();
      viewerRef.current.viewer = null;
    }

    if (cid === "FALLBACK" && (suggestion || formula)) {
      fetch(
        `https://cactus.nci.nih.gov/chemical/structure/${encodeURIComponent(
          suggestion || formula
        )}/sdf`
      )
        .then((res) => res.text())
        .then((molData) => {
          if (!molData || molData.toLowerCase().includes("not found")) {
            setCid("INVALID");
            return;
          }

          const viewer = $3Dmol.createViewer(viewerRef.current, {
            backgroundColor: "white",
            defaultcolors: $3Dmol.rasmolElementColors,
          });

          viewer.addModel(molData, "sdf");
          viewer.setStyle(
            {},
            { stick: { radius: 0.2 }, sphere: { scale: 0.3 } }
          );
          viewer.zoomTo();
          viewer.render();
          viewer.resize();

          function rotate() {
            if (!viewerRef.current) return;
            viewer.rotate(0.5);
            viewer.render();
            viewerRef.current.spinFrame = requestAnimationFrame(rotate);
          }
          rotate();

          viewerRef.current.viewer = viewer;

          const canvas = viewerRef.current.querySelector("canvas");
          if (canvas) {
            canvas.style.position = "absolute";
            canvas.style.top = 0;
            canvas.style.left = 0;
            canvas.style.width = "100%";
            canvas.style.height = "100%";
            canvas.style.display = "block";
          }
        })
        .catch(() => setCid("INVALID"));

      return;
    }

    const viewer = $3Dmol.createViewer(viewerRef.current, {
      backgroundColor: "white",
      defaultcolors: $3Dmol.rasmolElementColors,
    });

    viewerRef.current.viewer = viewer;

    try {
      fetch(
        `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/record/SDF/?record_type=3d`
      )
        .then(async (res) => {
          if (!res.ok) {
            console.warn(
              `PubChem 3D fetch failed with status ${res.status}. Triggering fallback...`
            );
            throw new Error(
              `PubChem 3D fetch failed with status ${res.status}`
            );
          }

          const molData = await res.text();

          if (
            !molData ||
            molData.trim().length < 10 ||
            molData.toLowerCase().includes("not found") ||
            molData.toLowerCase().includes("unsupported element") ||
            molData.toLowerCase().includes("error") ||
            molData.match(/^[\s\n]*$/)
          ) {
            console.warn(
              "PubChem 3D data invalid or empty. Triggering fallback..."
            );
            throw new Error("Invalid or unusable 3D data");
          }

          viewer.addModel(molData, "sdf");
          viewer.setStyle({}, { stick: {}, sphere: { scale: 0.3 } });
          viewer.zoomTo();
          viewer.render();
          viewer.resize();

          function rotate() {
            if (!viewerRef.current) return;
            viewer.rotate(0.8);
            viewer.render();
            viewerRef.current.spinFrame = requestAnimationFrame(rotate);
          }
          rotate();

          const canvas = viewerRef.current.querySelector("canvas");
          if (canvas) {
            canvas.style.position = "absolute";
            canvas.style.top = 0;
            canvas.style.left = 0;
            canvas.style.width = "100%";
            canvas.style.height = "100%";
            canvas.style.display = "block";
          }
        })
        .catch((err) => {
          console.warn("Fallback triggered due to PubChem failure:", err);
          setCid("FALLBACK");
        });
    } catch {
      setCid("FALLBACK");
    }
  }, [cid]);

  useEffect(() => {
    return () => {
      if (viewerRef.current?.spinFrame) {
        cancelAnimationFrame(viewerRef.current.spinFrame);
      }
    };
  }, []);

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
