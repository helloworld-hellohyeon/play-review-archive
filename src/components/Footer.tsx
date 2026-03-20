import styled from "@emotion/styled";
import { theme } from "../styles/theme";

const FooterEl = styled.footer`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  font-size: ${theme.fontSizes.xs};
  color: ${theme.colors.textSubtle};
`;

const Divider = styled.span`
  opacity: 0.4;
`;

const Link = styled.a`
  color: ${theme.colors.textSubtle};
  text-decoration: none;
  transition: color 0.15s;

  &:hover {
    color: ${theme.colors.textMuted};
  }
`;

export function Footer() {
  return (
    <FooterEl>
      <span>이매지너리</span>
      <Divider>·</Divider>
      <span>v0.0.1 beta</span>
      <Divider>·</Divider>
      <Link href="https://x.com/mouse_collector" target="_blank" rel="noopener noreferrer">
        @mouse_collector
      </Link>
    </FooterEl>
  );
}
