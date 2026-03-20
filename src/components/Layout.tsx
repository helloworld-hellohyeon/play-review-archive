import styled from "@emotion/styled";
import { theme } from "../styles/theme";

export const Container = styled.div`
  width: 100%;
  max-width: 560px;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

export const Header = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const Subtitle = styled.h2`
  font-size: ${theme.fontSizes.lg};
  font-weight: 400;
  color: ${theme.colors.textStrong};
  text-align: center;
`;

export const Title = styled.h1`
  font-size: ${theme.fontSizes.xxxl};
  font-weight: 900;
  color: ${theme.colors.textStrong};
  text-align: center;
  margin-top: 8px;
`;

export const PrimaryButton = styled.button`
  display: block;
  width: 100%;
  padding: 0.8rem;
  background: ${theme.colors.accent};
  color: white;
  border: none;
  border-radius: ${theme.radii.md};
  font-size: ${theme.fontSizes.md};
  font-weight: 600;
  cursor: pointer;
  transition:
    background 0.2s,
    opacity 0.2s;

  &:hover:not(:disabled) {
    background: ${theme.colors.accentHover};
  }

  &:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }
`;

export const DownloadButton = styled(PrimaryButton)`
  &:disabled {
    display: none;
  }
`;

export const ResetButton = styled.button`
  width: 100%;
  padding: 0.65rem;
  background: transparent;
  color: ${theme.colors.textSubtle};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.md};
  font-size: ${theme.fontSizes.body};
  cursor: pointer;
  transition:
    color 0.2s,
    border-color 0.2s;

  &:hover {
    color: ${theme.colors.textMuted};
    border-color: ${theme.colors.borderHover};
  }
`;

export const ErrorBox = styled.div`
  background: ${theme.colors.errorBg};
  border: 1px solid ${theme.colors.errorBorder};
  border-radius: ${theme.radii.md};
  padding: 0.75rem 1rem;
  font-size: ${theme.fontSizes.body};
  color: ${theme.colors.errorText};
`;

export const Code = styled.code`
  background: ${theme.colors.surface};
  border-radius: 4px;
  padding: 0.1em 0.4em;
  font-size: 0.85em;
  color: ${theme.colors.code};
`;
