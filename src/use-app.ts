interface UseAppReturn {
  title: string;
}

const useApp = (): UseAppReturn => {
  const title = 'T-Rex HTTP Client';
  return { title };
};

export { useApp };
