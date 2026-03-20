import styled from "@emotion/styled";
import { theme } from "../styles/theme";

interface Props {
  totalCount: number;
  rootCount: number;
  threadCount: number;
}

const Panel = styled.div`
  display: flex;
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.lg};
  padding: 1.25rem 1.5rem;
  gap: 1rem;
`;

const Stat = styled.div`
  flex: 1;
  text-align: center;
`;

const StatValue = styled.div`
  font-size: ${theme.fontSizes.xl};
  font-weight: 700;
  color: ${theme.colors.textStrong};
  line-height: 1.1;
`;

const StatLabel = styled.div`
  font-size: ${theme.fontSizes.xs};
  color: ${theme.colors.textSubtle};
  margin-top: 0.25rem;
`;

const Divider = styled.div`
  width: 1px;
  background: ${theme.colors.border};
  align-self: stretch;
`;

export function StatsPanel({ totalCount, rootCount, threadCount }: Props) {
  return (
    <Panel>
      <Stat>
        <StatValue>{totalCount.toLocaleString()}</StatValue>
        <StatLabel>총 트윗</StatLabel>
      </Stat>
      <Divider />
      <Stat>
        <StatValue>{rootCount.toLocaleString()}</StatValue>
        <StatLabel>루트</StatLabel>
      </Stat>
      <Divider />
      <Stat>
        <StatValue>{threadCount.toLocaleString()}</StatValue>
        <StatLabel>스레드</StatLabel>
      </Stat>
    </Panel>
  );
}
