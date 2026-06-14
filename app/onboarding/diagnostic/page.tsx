import DiagnosticForm from './DiagnosticForm'

type Props = {
  searchParams: Promise<{ returnTo?: string }>
}

export default async function DiagnosticPage({ searchParams }: Props) {
  const params = await searchParams
  const returnTo = params.returnTo ?? null
  return <DiagnosticForm returnTo={returnTo} />
}
