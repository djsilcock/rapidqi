import { useFormikContext } from "formik";
export function EffectComponent({ effect }) {
  effect(useFormikContext());
  return null;
}
EffectComponent.isInvisible = true;
