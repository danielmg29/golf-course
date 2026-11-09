import { type Material, type Mesh, type Object3D, ShaderMaterial, Texture } from "three";

/**
 * Removes `root` from its scene and frees the GPU memory of everything under it. The world's
 * renderer outlives its acts, so acts must give back what they allocated; nothing else will.
 */
export function disposeObject(root: Object3D) {
  root.removeFromParent();
  root.traverse((object) => {
    const { geometry, material } = object as Partial<Mesh>;
    geometry?.dispose();
    const materials: Material[] = Array.isArray(material) ? material : material ? [material] : [];
    for (const each of materials) {
      const values = each instanceof ShaderMaterial
        ? Object.values(each.uniforms).map((uniform) => uniform.value)
        : Object.values(each);
      for (const value of values) if (value instanceof Texture) value.dispose();
      each.dispose();
    }
  });
}
