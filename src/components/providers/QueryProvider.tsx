import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient()

function QueryProvider(props: {
    children: React.ReactNode
}) {
  return (
      <QueryClientProvider client={queryClient}>
        {props.children}
      </QueryClientProvider>
  )
}

export default QueryProvider