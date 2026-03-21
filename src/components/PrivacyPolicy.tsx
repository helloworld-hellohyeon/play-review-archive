import styled from "@emotion/styled";
import { theme } from "../styles/theme";

const Wrap = styled.div`
  max-width: 680px;
  margin: 60px auto;
  padding: 0 24px;
  line-height: 1.7;
`;

const Title = styled.h1`
  font-size: 1.5rem;
  margin-bottom: 4px;
  color: inherit;
`;

const Subtitle = styled.p`
  opacity: 0.5;
  font-size: 0.9rem;
  margin-bottom: 40px;
`;

const Section = styled.h2`
  font-size: 1rem;
  margin-top: 36px;
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid ${theme.colors.border};
  margin: 40px 0;
`;

const Updated = styled.p`
  opacity: 0.4;
  font-size: 0.85rem;
  margin-top: 60px;
`;

export function PrivacyPolicy() {
  return (
    <Wrap>
      <Title>개인정보처리방침</Title>
      <Subtitle>이매지너리 Thread Archive (Chrome Extension)</Subtitle>

      <Section>수집하는 데이터</Section>
      <p>이 익스텐션은 어떠한 사용자 데이터도 수집하지 않습니다.</p>

      <Section>데이터 처리 방식</Section>
      <p>
        익스텐션은 사용자가 열람 중인 Twitter/X 스레드 페이지의 DOM을 읽어 트윗 텍스트와
        이미지 URL을 추출합니다. 추출된 데이터는 사용자 기기에 ZIP 파일로 저장되며,
        어떠한 외부 서버로도 전송되지 않습니다.
      </p>

      <Section>외부 서버</Section>
      <p>이 익스텐션이 운영하는 서버는 없습니다. 분석 도구, 원격 로깅, 광고 네트워크를 사용하지 않습니다.</p>

      <Section>제3자 공유</Section>
      <p>수집되는 데이터가 없으므로 제3자와 공유하는 데이터도 없습니다.</p>

      <Divider />

      <Title>Privacy Policy</Title>
      <Subtitle>Imaginary Thread Archive (Chrome Extension)</Subtitle>

      <Section>Data Collection</Section>
      <p>This extension does not collect any user data.</p>

      <Section>How Data Is Processed</Section>
      <p>
        The extension reads the DOM of the Twitter/X thread page currently open in the browser
        to extract tweet text and image URLs. All extracted data is saved as a ZIP file on the
        user's device only and is never transmitted to any external server.
      </p>

      <Section>External Servers</Section>
      <p>This extension operates no servers. No analytics tools, remote logging, or ad networks are used.</p>

      <Section>Third-Party Sharing</Section>
      <p>Since no data is collected, no data is shared with third parties.</p>

      <Updated>Last updated: 2026-03-22</Updated>
    </Wrap>
  );
}
