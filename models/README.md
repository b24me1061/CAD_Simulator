# 3D CAD Model Analyzer

A web-based CAD model analysis and visualization application for inspecting 3D models and calculating important geometric and engineering properties.

The project combines **Mechanical Engineering concepts with Python-based geometry processing and interactive 3D visualization** to provide a practical tool for CAD model inspection.

---

## 🚀 Features

### 📐 CAD Model Analysis

The application calculates and displays:

- Model dimensions
- Length, width, and height
- Volume
- Surface area
- Number of vertices
- Number of triangles/faces
- Number of edges
- Center of mass
- Bounding box
- Watertight status
- Selected material
- Material density
- Estimated mass

### 🧊 Interactive 3D Viewer

The application includes an interactive **Three.js 3D model viewer**.

Users can:

- Rotate the model
- Zoom in and out
- Pan the model
- Reset the camera view
- Toggle wireframe mode
- Toggle grid
- Toggle coordinate axes

### 📂 Supported and Tested File Formats

The following formats have been tested with the current application:

| Format | Supported |
|---|---|
| STL | ✅ |
| OBJ | ✅ |
| PLY | ✅ |
| OFF | ✅ |
| GLB | ✅ |
| GLTF | ✅ |
| 3MF | ✅ |
| STEP | ✅ |
| STP | ✅ |
| IGES | ✅ |
| IGS | ✅ |

STEP/STP and IGES/IGS files are processed on the backend using **CadQuery/OpenCascade-based geometry processing**.

Other supported mesh/model formats can be processed and visualized using the application's geometry-processing and Three.js pipeline.

---

## 🧮 Engineering Calculations

### Volume

The application calculates the enclosed volume of the uploaded model.

### Surface Area

The total surface area is calculated from the model geometry.

### Bounding Box

The overall dimensions of the model are determined as:

- Length
- Width
- Height

### Center of Mass

The geometric center of mass is calculated from the model geometry.

### Mass

The estimated mass is calculated using the selected material density:

\[
m = ρ V
\]

where:

- `m` = mass
- `ρ` = material density
- `V` = volume

---

## 🧱 Material Database

The application includes a wide range of engineering materials for density and mass calculations.

### Metals

- Steel
- Stainless Steel
- Carbon Steel
- Tool Steel
- Cast Iron
- Ductile Iron
- Wrought Iron
- Aluminum
- Aluminum 6061
- Aluminum 7075
- Magnesium
- Copper
- Brass
- Bronze
- Titanium
- Nickel
- Zinc
- Lead
- Tin
- Cobalt
- Chromium
- Silver
- Gold
- Platinum

### Polymers

- ABS
- Nylon
- Polycarbonate
- PVC
- HDPE
- LDPE
- Polypropylene
- Polystyrene
- Acetal
- PTFE
- PEEK
- PET
- PMMA

### Composites and Other Materials

- Carbon Fiber
- Fiberglass
- GFRP
- CFRP
- Alumina
- Silicon Carbide
- Silicon Nitride
- Zirconia
- Ceramic
- Wood
- Rubber
- Natural Rubber

---

## 🛠️ Technology Stack

### Backend

- Python
- FastAPI
- Trimesh
- NumPy
- SciPy
- CadQuery
- OpenCascade

### Frontend

- HTML5
- CSS3
- JavaScript
- Three.js

### Development Tools

- Visual Studio Code
- Git
- GitHub
- Node.js
- npm
- Python Virtual Environment

---

## 🏗️ Project Structure

```text
CAD_Simulator/
│
├── backend/
│   └── main.py
│
├── frontend/
│   ├── index.html
│   ├── script.js
│   └── style.css
│
├── models/
│   ├── 01_cube_20mm.stl
│   ├── 02_cylinder_20x30mm.stl
│   ├── 03_cone_30x30mm.stl
│   ├── 04_rectangular_block_50x30x10mm.stl
│   ├── 05_test_cube_10mm.stl
│   ├── Bearing.3mf
│   ├── Duck.glb
│   ├── T100-P-BRACKET-R1.IGS
│   ├── T200-THRUSTER-BLUEESC-R1.IGS
│   ├── clean-reference.obj
│   ├── codo.stp
│   ├── cube.off
│   ├── cube_missing_corner.3mf
│   ├── cube_missing_corner.stl
│   ├── dobleCodo.stp
│   ├── duplicate-vertices.ply
│   ├── extra_vertices.obj
│   ├── invalid_stl_ascii.stl
│   ├── missing_triangle_hi.stl
│   ├── random_bits.3mf
│   └── solid2.stp
│
├── package.json
├── package-lock.json
├── requirements.txt
├── .gitignore
└── README.md
