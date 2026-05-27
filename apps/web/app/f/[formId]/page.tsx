import { RespondentTerminal } from "~/components/respondent/RespondentTerminal";
import { api } from "~/trpc/server";

export default async function FormRespondentPage({ params }: { params: Promise<{ formId: string }> }) {
  const { formId } = await params;
  
  const formConfig = await api.form.getPublicForm.query({ formIdOrSlug: formId }).catch(() => null);
  const activeTheme = formConfig?.theme || "terminal";

  let bgClass = "bg-[#050B14]"; // terminal
  if (activeTheme === "standard") bgClass = "bg-[#F0EBF8]";
  else if (activeTheme === "windowsxp") bgClass = "bg-teal-800";
  else if (activeTheme === "code_editor") bgClass = "bg-[#1E1E1E]";

  return (
    <main className={`h-screen w-screen overflow-hidden ${bgClass}`}>
      <RespondentTerminal formId={formId} initialData={formConfig} />
    </main>
  );
}
