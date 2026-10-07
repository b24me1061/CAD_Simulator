from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from OCP.IGESControl import IGESControl_Reader
from OCP.IFSelect import IFSelect_RetDone

import numpy as np
import cadquery as cq


import trimesh
import tempfile
import os


# ==========================================
# Create FastAPI application
# ==========================================

app = FastAPI()

materials = {

    # =========================
    # FERROUS METALS
    # =========================
    "steel": 7.85,
    "stainless_steel": 8.00,
    "carbon_steel": 7.85,
    "tool_steel": 7.80,
    "cast_iron": 7.20,
    "ductile_iron": 7.10,
    "wrought_iron": 7.70,

    # =========================
    # ALUMINUM & MAGNESIUM
    # =========================
    "aluminum": 2.70,
    "aluminum_6061": 2.70,
    "aluminum_7075": 2.81,
    "magnesium": 1.74,
    "magnesium_alloy": 1.80,

    # =========================
    # COPPER ALLOYS
    # =========================
    "copper": 8.96,
    "brass": 8.50,
    "bronze": 8.80,
    "phosphor_bronze": 8.80,

    # =========================
    # OTHER METALS
    # =========================
    "titanium": 4.51,
    "titanium_alloy": 4.43,
    "nickel": 8.91,
    "zinc": 7.14,
    "zinc_alloy": 6.60,
    "lead": 11.34,
    "tin": 7.31,
    "cobalt": 8.90,
    "chromium": 7.19,
    "manganese": 7.21,

    # =========================
    # PRECIOUS / SPECIAL METALS
    # =========================
    "silver": 10.49,
    "gold": 19.32,
    "platinum": 21.45,

    # =========================
    # ENGINEERING PLASTICS
    # =========================
    "abs": 1.04,
    "nylon": 1.14,
    "polycarbonate": 1.20,
    "pvc": 1.40,
    "hdpe": 0.95,
    "ldpe": 0.92,
    "polypropylene": 0.90,
    "polystyrene": 1.05,
    "acetal": 1.41,
    "ptfe": 2.20,
    "peek": 1.32,
    "pet": 1.38,
    "pmma": 1.18,

    # =========================
    # COMPOSITES
    # =========================
    "carbon_fiber": 1.60,
    "fiberglass": 1.85,
    "gfrp": 1.90,
    "cfrp": 1.60,

    # =========================
    # CERAMICS
    # =========================
    "alumina": 3.95,
    "silicon_carbide": 3.21,
    "silicon_nitride": 3.20,
    "zirconia": 6.05,
    "ceramic": 2.50,

    # =========================
    # WOOD / NATURAL MATERIALS
    # =========================
    "wood": 0.70,
    "rubber": 1.10,
    "natural_rubber": 0.93
}

# IGES loader
def load_iges(filepath):
    reader = IGESControl_Reader()

    status = reader.ReadFile(filepath)

    if status != IFSelect_RetDone:
        raise ValueError("Failed to read IGES file")

    reader.TransferRoots()

    shape = reader.OneShape()

    if shape.IsNull():
        raise ValueError("IGES file contains no valid geometry")

    return cq.Shape.cast(shape)


# ==========================================
# CAD MODEL ANALYSIS
# ==========================================

@app.post("/analyze")
async def analyze_cad(
    file: UploadFile = File(...),
    material: str = Form(...)
):

    extension = Path(file.filename).suffix.lower()

   
    # Save uploaded file temporarily
    MAX_FILE_SIZE = 50 * 1024 * 1024  # 50 MB

    with tempfile.NamedTemporaryFile(
        delete=False,
        suffix=extension
    ) as temp:

        total_size = 0

        while True:
            chunk = await file.read(1024 * 1024)  # 1 MB
            if not chunk:
                break

            total_size += len(chunk)

            if total_size > MAX_FILE_SIZE:
                temp.close()
                os.remove(temp.name)
                raise HTTPException(
                    status_code=413,
                    detail="File is too large. Maximum size is 50 MB."
                )

            temp.write(chunk)

        temp_path = temp.name

    try:
    # ------------------------------------------
    # Load CAD / Mesh model
    # ------------------------------------------



        if extension in [".step", ".stp"]:

            # ------------------------------------------
            # Load STEP
            # ------------------------------------------

            cad_model = cq.importers.importStep(
                temp_path
            )

            solid = cad_model.val()


        elif extension in [".iges", ".igs"]:

            # ------------------------------------------
            # Load IGES
            # ------------------------------------------

            solid = load_iges(temp_path)

            # CAD properties
        if extension in [".step", ".stp", ".iges", ".igs"]:

            # ------------------------------------------
            # CAD properties
            # ------------------------------------------

            volume = solid.Volume()
            surface_area = solid.Area()

            bbox = solid.BoundingBox()

            length = bbox.xlen
            width = bbox.ylen
            height = bbox.zlen

            center = solid.Center()

            center_of_mass = [
                center.x,
                center.y,
                center.z
            ]

            # ------------------------------------------
            # Tessellate CAD → Triangle Mesh
            # ------------------------------------------

            vertices, triangles = solid.tessellate(0.5)

            vertices = np.array([
                [v.x, v.y, v.z]
                for v in vertices
            ], dtype=float)

            triangles = np.array(triangles, dtype=int)

            model = trimesh.Trimesh(
                vertices=vertices,
                faces=triangles,
                process=True
            )

            # ------------------------------------------
            # Mesh properties
            # ------------------------------------------

            model.merge_vertices()

            faces = len(model.faces)

            unique_vertices, inverse = np.unique(
                model.vertices.round(8),
                axis=0,
                return_inverse=True
            )

            vertices_count = len(unique_vertices)

            geometric_edges = inverse[model.edges]
            geometric_edges = np.sort(
                geometric_edges,
                axis=1
            )

            edges = len(
                np.unique(
                    geometric_edges,
                    axis=0
                )
            )

            clean_model = trimesh.Trimesh(
                vertices=unique_vertices,
                faces=inverse[model.faces],
                process=True
            )

            mesh_watertight = clean_model.is_watertight

            # Material
            material = material.lower().strip()

            if material not in materials:
                raise HTTPException(
                    status_code=400,
                    detail=f"Unsupported material: {material}"
                )

            density = materials[material]

            volume_cm3 = volume / 1000

            mass_g = volume_cm3 * density
            mass_kg = mass_g / 1000

            return {
                "filename": file.filename,

                "dimensions": {
                    "length": round(float(length), 4),
                    "width": round(float(width), 4),
                    "height": round(float(height), 4)
                },

                "volume_mm3": round(float(volume), 8),

                "surface_area_mm2": round(
                    float(surface_area), 8
                ),

                "vertices": vertices_count,

                "triangles": faces,

                "edges": edges,

                "center_of_mass": [
                    round(float(center_of_mass[0]), 4),
                    round(float(center_of_mass[1]), 4),
                    round(float(center_of_mass[2]), 4)
                ],

                "bounding_box": [
                    round(float(length), 4),
                    round(float(width), 4),
                    round(float(height), 4)
                ],

                "watertight": mesh_watertight,

                "material": material.capitalize(),

                "density_g_cm3": density,

                "mass_g": round(float(mass_g), 8),

                "mass_kg": round(float(mass_kg), 8)
            }


        else:

            # ------------------------------------------
            # Existing mesh pipeline
            # ------------------------------------------

            model = trimesh.load(temp_path, force="mesh")

        

        model.merge_vertices()

        

        # ------------------------------------------
        # Basic geometry
        # ------------------------------------------

        length, width, height = model.extents

        volume = abs(model.volume)

        surface_area = model.area
       
        vertices = len(np.unique(model.vertices.round(8), axis=0))

        faces = len(model.faces)

        unique_vertices, inverse = np.unique(
             model.vertices.round(8), axis=0, return_inverse=True
        )

        geometric_edges = inverse[model.edges]
        geometric_edges = np.sort(geometric_edges, axis=1)
        edges = len(np.unique(geometric_edges, axis=0))

        clean_model = trimesh.Trimesh(
            vertices=unique_vertices,
            faces=inverse[model.faces],
            process=True
        )



        # ------------------------------------------
        # Center of Mass
        # ------------------------------------------

        center_of_mass = model.center_mass


        # ------------------------------------------
        # Bounding Box
        # ------------------------------------------

        bounding_box = model.bounding_box

        bbox_dimensions = bounding_box.extents


        # ------------------------------------------
        # Model Validation
        # ------------------------------------------

        watertight = clean_model.is_watertight


        material = material.lower().strip()

        if material not in materials:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported material: {material}"
            )

        density = materials[material]

        volume_cm3 = volume / 1000

        mass_g = volume_cm3 * density

        mass_kg = mass_g / 1000

        return {

            "filename": file.filename,

            "dimensions": {

                "length": round(
                    float(length), 4
                ),

                "width": round(
                    float(width), 4
                ),

                "height": round(
                    float(height), 4
                )
            },


            "volume_mm3": round(
                float(volume), 8
            ),


            "surface_area_mm2": round(
                float(surface_area), 8
            ),


            "vertices": vertices,


            "triangles": faces,

            "edges" : edges,


            "center_of_mass": [

                round(
                    float(center_of_mass[0]), 4
                ),

                round(
                    float(center_of_mass[1]), 4
                ),

                round(
                    float(center_of_mass[2]), 4
                )

            ],


            "bounding_box": [

                round(
                    float(bbox_dimensions[0]), 4
                ),

                round(
                    float(bbox_dimensions[1]), 4
                ),

                round(
                    float(bbox_dimensions[2]), 4
                )

            ],


            "watertight": watertight,

            "material": material.capitalize(),

            "density_g_cm3": density,

            "mass_g": round(float(mass_g), 8),

            "mass_kg": round(float(mass_kg), 8),
        }

    finally:

        if temp_path and os.path.exists(temp_path):

            try:
                os.remove(temp_path)

            except PermissionError:
                print("Could not delete temporary file.")


# ==========================================
# CAD VIEWER MESH CONVERSION
# ==========================================

@app.post("/convert-cad")
async def convert_cad(file: UploadFile = File(...)):

    extension = Path(file.filename).suffix.lower()

    if extension not in [".step", ".stp", ".iges", ".igs"]:
        return {
            "error": "Only STEP and IGES files are supported."
        }

    MAX_FILE_SIZE = 50 * 1024 * 1024  # 50 MB

    with tempfile.NamedTemporaryFile(
        delete=False,
        suffix=extension
    ) as temp:

        total_size = 0

        while True:
            chunk = await file.read(1024 * 1024)  # 1 MB
            if not chunk:
                break

            total_size += len(chunk)

            if total_size > MAX_FILE_SIZE:
                temp.close()
                os.remove(temp.name)
                raise HTTPException(
                    status_code=413,
                    detail="File is too large. Maximum size is 50 MB."
                )

            temp.write(chunk)

        temp_path = temp.name

    try:

        # ------------------------------------------
        # Load CAD model
        # ------------------------------------------

        if extension in [".step", ".stp"]:

            cad_model = cq.importers.importStep(temp_path)
            solid = cad_model.val()

        else:

            solid = load_iges(temp_path)

        # ------------------------------------------
        # Convert CAD → triangle mesh
        # ------------------------------------------

        vertices, triangles = solid.tessellate(0.5)

        vertices = [
            [float(v.x), float(v.y), float(v.z)]
            for v in vertices
        ]

        triangles = [
            [int(t[0]), int(t[1]), int(t[2])]
            for t in triangles
        ]

        return {
            "filename": file.filename,
            "vertices": vertices,
            "triangles": triangles
        }

    except Exception as e:

        print("CAD conversion error:", e)

        return {
            "error": str(e)
        }

    finally:

        if temp_path and os.path.exists(temp_path):

            try:
                os.remove(temp_path)

            except PermissionError:
                print("Could not delete temporary file.")

# ==========================================
# SERVE FRONTEND
# ==========================================

BASE_DIR = Path(__file__).resolve().parent.parent

FRONTEND_DIR = BASE_DIR / "frontend"

NODE_MODULES_DIR = BASE_DIR / "node_modules"

app.mount(
    "/node_modules",
    StaticFiles(directory=NODE_MODULES_DIR),
    name="node_modules"
)
app.mount(
    "/",
    StaticFiles(
        directory=FRONTEND_DIR,
        html=True
    ),
    name="frontend"
)