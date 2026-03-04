import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "개인정보처리방침 - 시시덕",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8 py-4">
      <h1 className="text-2xl font-bold text-foreground">개인정보처리방침</h1>
      <p className="text-sm text-muted-foreground">
        시행일: 2026년 3월 1일
      </p>

      <div className="space-y-6 text-sm leading-relaxed text-foreground">
        <section className="space-y-2">
          <h2 className="text-lg font-semibold">1. 개인정보의 수집 및 이용 목적</h2>
          <p>
            시시덕(이하 &quot;서비스&quot;)은 다음의 목적을 위해 개인정보를 수집 및
            이용합니다.
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>회원 가입 및 관리: 본인 식별, 서비스 이용</li>
            <li>서비스 제공: 티어리스트 생성, 저장, 공유 기능</li>
            <li>서비스 개선: 이용 통계 분석, 서비스 품질 향상</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">2. 수집하는 개인정보 항목</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              소셜 로그인 시: 이름(닉네임), 이메일 주소, 프로필 이미지 URL
            </li>
            <li>
              서비스 이용 시 자동 수집: 접속 IP, 브라우저 정보, 접속 일시,
              쿠키
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">3. 개인정보의 보유 및 이용 기간</h2>
          <p>
            회원 탈퇴 시 또는 수집 목적 달성 시 지체 없이 파기합니다. 단,
            관련 법령에 따라 보존이 필요한 경우 해당 기간 동안 보관합니다.
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>전자상거래법에 따른 계약/청약철회 기록: 5년</li>
            <li>통신비밀보호법에 따른 접속 기록: 3개월</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">4. 개인정보의 제3자 제공</h2>
          <p>
            서비스는 원칙적으로 이용자의 개인정보를 제3자에게 제공하지
            않습니다. 다만, 법령에 의해 요구되는 경우는 예외로 합니다.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">5. 개인정보의 파기 절차 및 방법</h2>
          <p>
            전자적 파일 형태의 개인정보는 복구할 수 없는 방법으로 영구
            삭제합니다.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">6. 쿠키 및 광고</h2>
          <p>
            서비스는 Google AdSense를 통해 광고를 게재할 수 있으며, 이 과정에서
            Google은 쿠키를 사용하여 이용자의 관심사에 기반한 광고를 표시할 수
            있습니다.
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Google의 쿠키 사용에 대한 자세한 내용은{" "}
              <a
                href="https://policies.google.com/technologies/ads"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                Google 광고 정책
              </a>
              을 참조하세요.
            </li>
            <li>
              이용자는 브라우저 설정을 통해 쿠키 저장을 거부하거나{" "}
              <a
                href="https://adssettings.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                Google 광고 설정
              </a>
              에서 맞춤 광고를 비활성화할 수 있습니다.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">7. 이용자의 권리</h2>
          <p>
            이용자는 언제든지 자신의 개인정보에 대해 열람, 수정, 삭제를
            요청할 수 있으며, 회원 탈퇴를 통해 개인정보 처리를 중단할 수
            있습니다.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">8. 개인정보 보호책임자</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>서비스명: 시시덕 (sisiduck)</li>
            <li>문의: sisiduck.official@gmail.com</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">9. 개인정보처리방침의 변경</h2>
          <p>
            본 방침은 시행일로부터 적용되며, 변경 사항이 있을 경우 서비스
            내 공지를 통해 안내합니다.
          </p>
        </section>
      </div>
    </div>
  );
}
