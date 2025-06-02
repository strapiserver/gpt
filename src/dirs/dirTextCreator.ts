import callStrapi from "../services/callStrapi";
import { CreateTextBoxMutation } from "../services/queries";

export default async (
  text: string,
  key: string,
  locale: "en" | "ru",
  slug: string
) => {
  const res = await callStrapi(CreateTextBoxMutation, {
    text,
    key,
    locale,
    subtitle: slug,
  });
  return res?.createTextBox?.id;
};
