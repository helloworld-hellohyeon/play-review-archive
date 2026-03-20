import styled from "@emotion/styled";
import { theme } from "../styles/theme";

interface Props {
  label: string;
  progress: number; // 0 ~ 1
}

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.div`
  font-size: ${theme.fontSizes.base};
  color: ${theme.colors.textMuted};
`;

const Track = styled.div`
  background: ${theme.colors.surface};
  border-radius: ${theme.radii.full};
  height: 6px;
  overflow: hidden;
`;

const Fill = styled.div<{ $progress: number }>`
  background: ${theme.colors.accent};
  height: 100%;
  border-radius: ${theme.radii.full};
  width: ${({ $progress }) => Math.round($progress * 100)}%;
  transition: width 0.1s;
`;

export function ProgressBar({ label, progress }: Props) {
  return (
    <Section>
      <Label>{label}</Label>
      <Track>
        <Fill $progress={progress} />
      </Track>
    </Section>
  );
}
