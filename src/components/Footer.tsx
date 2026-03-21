import { useState } from "react";
import styled from "@emotion/styled";
import { theme } from "../styles/theme";

const FooterEl = styled.footer`
  width: 100%;
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

const ThanksBtn = styled.button`
  background: none;
  border: none;
  padding: 0;
  font-size: inherit;
  color: ${theme.colors.textSubtle};
  cursor: pointer;
  transition: color 0.15s;

  &:hover {
    color: ${theme.colors.textMuted};
  }
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 1.5rem;
`;

const Modal = styled.div`
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.lg};
  padding: 1.75rem;
  width: 100%;
  max-width: 360px;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const ModalTitle = styled.h2`
  font-size: ${theme.fontSizes.lg};
  font-weight: 700;
  color: ${theme.colors.textStrong};
`;

const Group = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
`;

const GroupLabel = styled.p`
  font-size: ${theme.fontSizes.xs};
  color: ${theme.colors.textSubtle};
  margin-bottom: 0.1rem;
`;

const Name = styled.span`
  font-size: ${theme.fontSizes.body};
  color: ${theme.colors.text};
`;

const CloseBtn = styled.button`
  align-self: flex-end;
  background: none;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.sm};
  padding: 0.35rem 0.9rem;
  font-size: ${theme.fontSizes.xs};
  color: ${theme.colors.textMuted};
  cursor: pointer;
  transition:
    border-color 0.15s,
    color 0.15s;

  &:hover {
    border-color: ${theme.colors.borderHover};
    color: ${theme.colors.text};
  }
`;

const THANKS: { category: string; names: string[] }[] = [
  {
    category: "베타테스터",
    names: ["에", "책", "정현", "짜굴"],
  },
  {
    category: "Special Thanks to",
    names: ["뮤지컬 이매지너리"],
  },
];

export function Footer() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <FooterEl>
        <span>v0.0.1 beta</span>
        <Divider>·</Divider>
        <Link href="https://forms.gle/bzDna7YKmPLwhovk9" target="_blank" rel="noopener noreferrer">
          오류/기능 피드백
        </Link>
        <Divider>·</Divider>
        by.{" "}
        <Link href="https://x.com/mouse_collector" target="_blank" rel="noopener noreferrer">
          @mouse_collector
        </Link>
        <Divider>·</Divider>
        <ThanksBtn onClick={() => setOpen(true)}>thanks to</ThanksBtn>
      </FooterEl>

      {open && (
        <Overlay onClick={() => setOpen(false)}>
          <Modal onClick={(e) => e.stopPropagation()}>
            <ModalTitle>Thanks to 🙏</ModalTitle>
            {THANKS.map(({ category, names }) => (
              <Group key={category}>
                <GroupLabel>{category}</GroupLabel>
                {names.map((name) => (
                  <Name key={name}>{name}</Name>
                ))}
              </Group>
            ))}
            <CloseBtn onClick={() => setOpen(false)}>닫기</CloseBtn>
          </Modal>
        </Overlay>
      )}
    </>
  );
}
