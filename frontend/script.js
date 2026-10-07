import * as THREE from "/node_modules/three/build/three.module.js";

import { OrbitControls } from "/node_modules/three/examples/jsm/controls/OrbitControls.js";

import { STLLoader } from "/node_modules/three/examples/jsm/loaders/STLLoader.js";

import { OBJLoader } from "/node_modules/three/examples/jsm/loaders/OBJLoader.js";

import { PLYLoader } from "/node_modules/three/examples/jsm/loaders/PLYLoader.js";

import { GLTFLoader } from "/node_modules/three/examples/jsm/loaders/GLTFLoader.js";

import { ThreeMFLoader } from "/node_modules/three/examples/jsm/loaders/3MFLoader.js";

const fileInput = document.getElementById("fileInput");
const analyzeButton = document.getElementById("analyzeButton");
const materialSelect = document.getElementById("material");
const results = document.getElementById("results");

/* =========================================================
   THREE.JS VIEWER
========================================================= */

const viewerContainer = document.getElementById("viewerContainer");

let scene;
let camera;
let renderer;
let controls;

let currentModel = null;

let gridHelper = null;
let axesHelper = null;
let wireframeEnabled = false;


/* =========================================================
   INITIALIZE 3D VIEWER
========================================================= */

function initViewer() {

    /* -------------------------
       Scene
    ------------------------- */

    scene = new THREE.Scene();

    scene.background = new THREE.Color(0xeef1f5);


    /* -------------------------
       Camera
    ------------------------- */

    camera = new THREE.PerspectiveCamera(
        45,
        viewerContainer.clientWidth /
        viewerContainer.clientHeight,
        0.01,
        100000
    );

    camera.position.set(5, 5, 5);


    /* -------------------------
       Renderer
    ------------------------- */

    renderer = new THREE.WebGLRenderer({
        antialias: true
    });

    renderer.setPixelRatio(
        window.devicePixelRatio
    );

    renderer.setSize(
        viewerContainer.clientWidth,
        viewerContainer.clientHeight
    );

    viewerContainer.innerHTML = "";

    viewerContainer.appendChild(
        renderer.domElement
    );


    /* -------------------------
       Orbit Controls
    ------------------------- */

    controls = new OrbitControls(
        camera,
        renderer.domElement
    );

    controls.enableDamping = true;

    controls.dampingFactor = 0.05;

    controls.enableZoom = true;

    controls.enablePan = true;


    /* -------------------------
       Lighting
    ------------------------- */

    const ambientLight =
        new THREE.AmbientLight(
            0xffffff,
            1.5
        );

    scene.add(ambientLight);


    const directionalLight =
        new THREE.DirectionalLight(
            0xffffff,
            2
        );

    directionalLight.position.set(
        5,
        10,
        7
    );

    scene.add(directionalLight);


    const directionalLight2 =
        new THREE.DirectionalLight(
            0xffffff,
            1
        );

    directionalLight2.position.set(
        -5,
        -5,
        -5
    );

    scene.add(directionalLight2);


    /* -------------------------
       Grid
    ------------------------- */

    gridHelper = new THREE.GridHelper(
        10,
        10
    );

    scene.add(gridHelper);


    /* -------------------------
       Axes
    ------------------------- */

    axesHelper =
        new THREE.AxesHelper(5);

    scene.add(axesHelper);


    /* -------------------------
       Window Resize
    ------------------------- */

    window.addEventListener(
        "resize",
        resizeViewer
    );


    /* -------------------------
       Start Rendering
    ------------------------- */

    animateViewer();
}


/* =========================================================
   ANIMATION LOOP
========================================================= */

function animateViewer() {

    requestAnimationFrame(
        animateViewer
    );

    if (controls) {
        controls.update();
    }

    renderer.render(
        scene,
        camera
    );
}


/* =========================================================
   RESIZE VIEWER
========================================================= */

function resizeViewer() {

    if (!camera || !renderer) {
        return;
    }

    const width =
        viewerContainer.clientWidth;

    const height =
        viewerContainer.clientHeight;

    camera.aspect =
        width / height;

    camera.updateProjectionMatrix();

    renderer.setSize(
        width,
        height
    );
}


/* =========================================================
   START VIEWER
========================================================= */

initViewer();

/* =========================================================
   LOAD MODEL FROM SELECTED FILE
========================================================= */
function loadSTL(file) {
    const reader = new FileReader();

    reader.onload = function (event) {
        const loader = new STLLoader();

        const geometry = loader.parse(event.target.result);

        geometry.computeVertexNormals();

        const material = new THREE.MeshStandardMaterial({
            color: 0x6699cc,
            metalness: 0.2,
            roughness: 0.7
        });

        const mesh = new THREE.Mesh(geometry, material);

        // Remove previous model
        if (currentModel) {
            scene.remove(currentModel);
            currentModel = null;
        }

        currentModel = mesh;
        scene.add(currentModel);

        // Center and fit model in viewer
        fitModelToView(currentModel);

        console.log("STL loaded successfully");
    };

    reader.readAsArrayBuffer(file);
}


function loadOBJ(file) {
    const reader = new FileReader();

    reader.onload = function (event) {
        const loader = new OBJLoader();
        const object = loader.parse(event.target.result);

        if (currentModel) {
            scene.remove(currentModel);
            currentModel = null;
        }

        object.traverse(function (child) {
            if (child.isMesh) {
                child.material = new THREE.MeshStandardMaterial({
                    color: 0x6699cc,
                    metalness: 0.2,
                    roughness: 0.7
                });
            }
        });

        currentModel = object;
        scene.add(currentModel);

        fitModelToView(currentModel);

        console.log("OBJ loaded successfully");
    };

    reader.readAsText(file);
}


function loadPLY(file) {
    const reader = new FileReader();

    reader.onload = function (event) {
        const loader = new PLYLoader();

        const geometry = loader.parse(event.target.result);

        geometry.computeVertexNormals();

        const material = new THREE.MeshStandardMaterial({
            color: 0x6699cc,
            metalness: 0.2,
            roughness: 0.7
        });

        const mesh = new THREE.Mesh(geometry, material);

        if (currentModel) {
            scene.remove(currentModel);
            currentModel = null;
        }

        currentModel = mesh;
        scene.add(currentModel);

        fitModelToView(currentModel);

        console.log("PLY loaded successfully");
    };

    reader.readAsArrayBuffer(file);
}


function loadGLTF(file) {
    const reader = new FileReader();

    reader.onload = function (event) {
        const loader = new GLTFLoader();

        loader.parse(
            event.target.result,
            "",
            function (gltf) {

                if (currentModel) {
                    scene.remove(currentModel);
                    currentModel = null;
                }

                currentModel = gltf.scene;

                scene.add(currentModel);

                fitModelToView(currentModel);

                console.log("GLTF / GLB loaded successfully");
            },
            function (error) {
                console.error("GLTF / GLB loading error:", error);
                alert("Failed to load GLB/GLTF file.");
            }
        );
    };

    if (
        file.name.toLowerCase().endsWith(".glb")
    ) {
        reader.readAsArrayBuffer(file);
    } else {
        reader.readAsArrayBuffer(file);
    }
}


function load3MF(file) {
    const reader = new FileReader();

    reader.onload = function (event) {
        const loader = new ThreeMFLoader();

        try {
            const object = loader.parse(event.target.result);

            if (currentModel) {
                scene.remove(currentModel);
                currentModel = null;
            }

            currentModel = object;

            scene.add(currentModel);

            fitModelToView(currentModel);

            console.log("3MF loaded successfully");

        } catch (error) {
            console.error("3MF loading error:", error);
            alert("Failed to load 3MF file.");
        }
    };

    reader.readAsArrayBuffer(file);
}


function loadOFF(file) {
    const reader = new FileReader();

    reader.onload = function (event) {

        try {
            const text = event.target.result.trim();
            const lines = text.split(/\r?\n/);

            let lineIndex = 0;

            // Remove comments and empty lines
            const cleanLines = lines
                .map(line => line.trim())
                .filter(line => line !== "" && !line.startsWith("#"));

            // First line must be OFF
            if (cleanLines[0] !== "OFF") {
                throw new Error("Invalid OFF file.");
            }

            lineIndex = 1;

            // Number of vertices and faces
            const counts = cleanLines[lineIndex]
                .split(/\s+/)
                .map(Number);

            lineIndex++;

            const vertexCount = counts[0];
            const faceCount = counts[1];

            const vertices = [];

            for (let i = 0; i < vertexCount; i++) {

                const values = cleanLines[lineIndex]
                    .split(/\s+/)
                    .map(Number);

                vertices.push(
                    values[0],
                    values[1],
                    values[2]
                );

                lineIndex++;
            }

            const indices = [];

            for (let i = 0; i < faceCount; i++) {

                const values = cleanLines[lineIndex]
                    .split(/\s+/)
                    .map(Number);

                const numberOfVertices = values[0];

                // Triangulate polygon
                for (let j = 1; j < numberOfVertices - 1; j++) {

                    indices.push(
                        values[1],
                        values[j + 1],
                        values[j + 2]
                    );
                }

                lineIndex++;
            }

            const geometry = new THREE.BufferGeometry();

            geometry.setAttribute(
                "position",
                new THREE.Float32BufferAttribute(vertices, 3)
            );

            geometry.setIndex(indices);

            geometry.computeVertexNormals();

            const material = new THREE.MeshStandardMaterial({
                color: 0x6699cc,
                metalness: 0.2,
                roughness: 0.7
            });

            const mesh = new THREE.Mesh(
                geometry,
                material
            );

            if (currentModel) {
                scene.remove(currentModel);
                currentModel = null;
            }

            currentModel = mesh;

            scene.add(currentModel);

            fitModelToView(currentModel);

            console.log("OFF loaded successfully");

        } catch (error) {

            console.error("OFF loading error:", error);

            alert(
                "Failed to load OFF file."
            );
        }
    };

    reader.readAsText(file);
}

async function loadCADFromBackend(file) {
    try {
        console.log("Sending CAD file to backend:", file.name);

        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/convert-cad", {
            method: "POST",
            body: formData
        });

        if (!response.ok) {
            const errorData = await response.json();

            throw new Error(
                errorData.detail || `Server error: ${response.status}`
            );
        }
        const data = await response.json();

        if (data.error) {
            throw new Error(data.error);
        }

        console.log("CAD mesh received from backend");

        // ------------------------------------------
        // Create Three.js geometry
        // ------------------------------------------

        const geometry = new THREE.BufferGeometry();

        const positions = [];

        for (const triangle of data.triangles) {

            const a = data.vertices[triangle[0]];
            const b = data.vertices[triangle[1]];
            const c = data.vertices[triangle[2]];

            positions.push(
                a[0], a[1], a[2],
                b[0], b[1], b[2],
                c[0], c[1], c[2]
            );
        }

        geometry.setAttribute(
            "position",
            new THREE.Float32BufferAttribute(
                positions,
                3
            )
        );

        geometry.computeVertexNormals();

        const material = new THREE.MeshStandardMaterial({
            color: 0x6699cc,
            metalness: 0.2,
            roughness: 0.7
        });

        const mesh = new THREE.Mesh(
            geometry,
            material
        );

        // ------------------------------------------
        // Remove previous model
        // ------------------------------------------

        if (currentModel) {
            scene.remove(currentModel);
            currentModel = null;
        }

        currentModel = mesh;

        scene.add(currentModel);

        // ------------------------------------------
        // Fit model to viewer
        // ------------------------------------------

        fitModelToView(currentModel);

        console.log(
            "STEP / IGES loaded successfully:",
            file.name
        );

    } catch (error) {

        console.error(
            "STEP / IGES loading error:",
            error
        );

        alert(
            "Failed to load STEP / IGES file:\n" +
            error.message
        );
    }
}


function fitModelToView(model) {
    const box = new THREE.Box3().setFromObject(model);

    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    // Move model to the center of the scene
    model.position.sub(center);

    // Find the largest dimension
    const maxDimension = Math.max(
        size.x,
        size.y,
        size.z
    );

    // Position camera based on model size
    const distance = maxDimension * 2.5;

    camera.position.set(
        distance,
        distance,
        distance
    );

    camera.near = maxDimension / 1000;
    camera.far = maxDimension * 1000;
    camera.updateProjectionMatrix();

    // Make OrbitControls look at model center
    controls.target.set(0, 0, 0);
    controls.update();
}


function loadSelectedModel(file) {

    if (!file) {
        return;
    }

    const fileName = file.name.toLowerCase();

    console.log("Selected file:", file.name);


    /* =====================================================
       STL
    ===================================================== */

    if (fileName.endsWith(".stl")) {

        loadSTL(file);

    }


    /* =====================================================
       OBJ
    ===================================================== */

    else if (fileName.endsWith(".obj")) {

        loadOBJ(file);

    }


    /* =====================================================
       PLY
    ===================================================== */

    else if (fileName.endsWith(".ply")) {

        loadPLY(file);

    }


    /* =====================================================
       GLB / GLTF
    ===================================================== */

    else if (
        fileName.endsWith(".glb") ||
        fileName.endsWith(".gltf")
    ) {

        loadGLTF(file);

    }


    /* =====================================================
       3MF
    ===================================================== */

    else if (fileName.endsWith(".3mf")) {

        load3MF(file);

    }


    /* =====================================================
       OFF
    ===================================================== */

            else if (fileName.endsWith(".off")) {

            loadOFF(file);

        }


    /* =====================================================
       STEP / IGES
    ===================================================== */

    else if (
            fileName.endsWith(".step") ||
            fileName.endsWith(".stp") ||
            fileName.endsWith(".iges") ||
            fileName.endsWith(".igs")
        ) {

            loadCADFromBackend(file);

        }


    /* =====================================================
       UNKNOWN FORMAT
    ===================================================== */

    else {

        alert(
            "Unsupported file format."
        );

    }
}

fileInput.addEventListener(
    "change",
    function () {

        const file = fileInput.files[0];

        if (!file) {
            return;
        }

        loadSelectedModel(file);

    }
);


// ==========================================
// VIEWER CONTROLS
// ==========================================

const resetViewButton = document.getElementById("resetView");
const toggleWireframeButton = document.getElementById("toggleWireframe");
const toggleGridButton = document.getElementById("toggleGrid");
const toggleAxesButton = document.getElementById("toggleAxes");


// ------------------------------------------
// Reset View
// ------------------------------------------

resetViewButton.addEventListener("click", function () {

    if (!currentModel) {
        return;
    }

    fitModelToView(currentModel);

});


// ------------------------------------------
// Toggle Wireframe
// ------------------------------------------

toggleWireframeButton.addEventListener("click", function () {

    if (!currentModel) {
        return;
    }

    wireframeEnabled = !wireframeEnabled;

    currentModel.traverse(function (child) {

        if (child.isMesh && child.material) {

            if (Array.isArray(child.material)) {

                child.material.forEach(function (material) {
                    material.wireframe = wireframeEnabled;
                });

            } else {

                child.material.wireframe = wireframeEnabled;

            }
        }
    });

    toggleWireframeButton.textContent =
        wireframeEnabled ? "Solid" : "Wireframe";

});


// ------------------------------------------
// Toggle Grid
// ------------------------------------------

toggleGridButton.addEventListener("click", function () {

    if (!gridHelper) {
        return;
    }

    gridHelper.visible = !gridHelper.visible;

    toggleGridButton.textContent =
        gridHelper.visible ? "Hide Grid" : "Grid";

});


// ------------------------------------------
// Toggle Axes
// ------------------------------------------

toggleAxesButton.addEventListener("click", function () {

    if (!axesHelper) {
        return;
    }

    axesHelper.visible = !axesHelper.visible;

    toggleAxesButton.textContent =
        axesHelper.visible ? "Hide Axes" : "Axes";

});


analyzeButton.addEventListener("click", async () => {

    const file = fileInput.files[0];

    // Check if file is selected
    if (!file) {
        alert("Please select a 3D CAD file.");
        return;
    }

    // Check file type
    const allowedExtensions = [".stl", ".obj", ".ply", ".off", ".glb", ".gltf",".3mf", ".stp", ".step", ".iges",".igs"];
    const extension = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();

    if (!allowedExtensions.includes(extension)) {
        alert("Please select a valid STL, OBJ, PLY, OFF, GLB, GLTF, 3MF, STP,STEP,IGES,IGS file.");
        return;
    }

    // Create form data
    const formData = new FormData();
    formData.append("file", file);

    const material = materialSelect.value;

    formData.append("material", material);

    // Show loading message
    results.innerHTML = "<p>Analyzing model...</p>";

    // Disable button while analyzing
    analyzeButton.disabled = true;
    analyzeButton.innerText = "Analyzing...";

    try {

        // Send file to FastAPI backend
        const response = await fetch("/analyze", {
            method: "POST",
            body: formData
        });

        // Check HTTP response
        if (!response.ok) {
            const errorData = await response.json();

            throw new Error(
                errorData.detail || `Server error: ${response.status}`
            );
        }

        // Convert response to JSON
        const data = await response.json();

        // Update result header
        document.getElementById("resultFilename").innerText =
            data.filename;

        // Update model status
        const status = document.getElementById("modelStatus");

        if (data.watertight) {
            status.className = "status valid";
            status.innerHTML = "✓ WATERTIGHT";
        } else {
            status.className = "status warning";
            status.innerHTML = "⚠ NOT WATERTIGHT";
        }

    // Display results
    results.innerHTML = `

        <!-- Model Information -->
        <div class="info-row">

            <div class="info-item">
                <span class="label">FILE TYPE</span>
                <span class="value">
                    ${data.filename.split(".").pop().toUpperCase()}
                </span>
            </div>

            <div class="info-item">
                <span class="label">MATERIAL</span>
                <span class="value">
                    ${data.material}
                </span>
            </div>

            <div class="info-item">
                <span class="label">DENSITY</span>
                <span class="value">
                    ${data.density_g_cm3} g/cm³
                </span>
            </div>

        </div>


        <!-- Geometry + Physical Properties -->
        <div class="analysis-grid">

            <!-- Geometry -->
            <div class="analysis-panel">

                <h3>GEOMETRY</h3>

                <div class="property-row">
                    <span>Length</span>
                    <strong>
                        ${data.dimensions.length} mm
                    </strong>
                </div>

                <div class="property-row">
                    <span>Width</span>
                    <strong>
                        ${data.dimensions.width} mm
                    </strong>
                </div>

                <div class="property-row">
                    <span>Height</span>
                    <strong>
                        ${data.dimensions.height} mm
                    </strong>
                </div>

            </div>


            <!-- Physical Properties -->
            <div class="analysis-panel">

                <h3>PHYSICAL PROPERTIES</h3>

                <div class="property-row">
                    <span>Volume</span>
                    <strong>
                        ${data.volume_mm3} mm³
                    </strong>
                </div>

                <div class="property-row">
                    <span>Surface Area</span>
                    <strong>
                        ${data.surface_area_mm2} mm²
                    </strong>
                </div>

                <div class="property-row">
                    <span>Mass</span>
                    <strong>
                        ${data.mass_g} g
                    </strong>
                </div>

            </div>

        </div>


        <!-- Mesh Analysis -->
        <div class="mesh-panel">

            <h3>MESH ANALYSIS</h3>

            <div class="mesh-grid">

                <div class="mesh-stat">
                    <strong>${data.vertices}</strong>
                    <span>VERTICES</span>
                </div>

                <div class="mesh-stat">
                    <strong>${data.triangles}</strong>
                    <span>TRIANGLES</span>
                </div>

                <div class="mesh-stat">
                    <strong>${data.edges}</strong>
                    <span>EDGES</span>
                </div>

                <div class="mesh-stat">
                    <strong>
                        ${data.watertight ? "YES" : "NO"}
                    </strong>
                    <span>WATERTIGHT</span>
                </div>

            </div>

        </div>


        <!-- Center of Mass -->
        <div class="com-panel">

            <h3>CENTER OF MASS</h3>

            <div class="com-grid">

                <div>
                    <span>X</span>
                    <strong>
                        ${data.center_of_mass[0]} mm
                    </strong>
                </div>

                <div>
                    <span>Y</span>
                    <strong>
                        ${data.center_of_mass[1]} mm
                    </strong>
                </div>

                <div>
                    <span>Z</span>
                    <strong>
                        ${data.center_of_mass[2]} mm
                    </strong>
                </div>

            </div>

        </div>

    `;

    } catch (error) {

        console.error("Analysis error:", error);

        results.innerHTML = `
            <div class="result-placeholder">

                <h3>Analysis Failed</h3>

                <p>
                    Unable to analyze the model.
                </p>

                <p>
                    ${error.message}
                </p>

            </div>
        `;

    } finally {

        // Enable button again
        analyzeButton.disabled = false;
        analyzeButton.innerText = "Analyze Model";
        }
});