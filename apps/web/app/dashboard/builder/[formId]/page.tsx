import BuilderLayout from "~/components/builder/BuilderLayout";

export default async function BuilderPage({ 
  params,
  searchParams,
}: { 
  params: Promise<{ formId: string }>;
  searchParams: Promise<{ view?: string }>;
}) {
  const { formId } = await params;
  const resolvedParams = await searchParams;
  const view = resolvedParams?.view;
  return <BuilderLayout formId={formId} initialView={(view === 'analytics' || view === 'settings') ? view : 'build'} />;
}
