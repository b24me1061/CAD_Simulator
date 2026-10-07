import trimesh
import os

# -----------------------------
# Material database
# Density in g/cm³
# -----------------------------

materials = {
    "steel": 7.85,
    "aluminum": 2.70,
    "copper": 8.96,
    "brass": 8.50,
    "titanium": 4.51
}

# -----------------------------
# Load STL model
# -----------------------------

filename = input("Enter STL filename: ")

file_path = os.path.join("models", filename)

model = trimesh.load(file_path)

# -----------------------------
# Geometry properties
# -----------------------------

length, width, height = model.extents

volume_mm3 = model.volume
surface_area_mm2 = model.area

vertices = len(model.vertices)
faces = len(model.faces)

# Convert volume
# 1 cm³ = 1000 mm³
volume_cm3 = volume_mm3 / 1000

# -----------------------------
# Select material
# -----------------------------

print("\nAvailable materials:")

for material in materials:
    print("-", material)

material = input("\nEnter material: ").lower()

if material in materials:

    density = materials[material]

    # Mass = Density × Volume
    mass_g = density * volume_cm3
    mass_kg = mass_g / 1000

else:
    print("\nInvalid material!")
    mass_g = None
    mass_kg = None

# -----------------------------
# Additional CAD properties
# -----------------------------

# Center of mass
center_of_mass = model.center_mass

# Bounding box
bounding_box = model.bounding_box
bbox_dimensions = bounding_box.extents

# Check whether mesh is watertight
is_valid = model.is_watertight 

# -----------------------------
# Display results
# -----------------------------

print("\n========== CAD MODEL ANALYZER ==========\n")

print(f"Model: {filename}")

print("\n--- Dimensions ---")
print(f"Length       : {length:.2f} mm")
print(f"Width        : {width:.2f} mm")
print(f"Height       : {height:.2f} mm")

print("\n--- Geometry ---")
print(f"Volume       : {volume_mm3:.2f} mm³")
print(f"Surface Area : {surface_area_mm2:.2f} mm²")
print(f"Vertices     : {vertices}")
print(f"Faces        : {faces}")

if mass_g is not None:
    print("\n--- Material ---")
    print(f"Material     : {material.capitalize()}")
    print(f"Density      : {density:.2f} g/cm³")
    print(f"Mass         : {mass_g:.2f} g")
    print(f"Mass         : {mass_kg:.4f} kg")

print("\n--- Additional Properties ---")

print(
    f"Center of Mass : "
    f"({center_of_mass[0]:.2f}, "
    f"{center_of_mass[1]:.2f}, "
    f"{center_of_mass[2]:.2f}) mm"
)

print(f"Bounding Box   : "
      f"{bbox_dimensions[0]:.2f} x "
      f"{bbox_dimensions[1]:.2f} x "
      f"{bbox_dimensions[2]:.2f} mm")

print(f"Watertight     : {is_valid}")
print("\n=========================================")