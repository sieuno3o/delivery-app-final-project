from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    Flowable,
    KeepTogether,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "output" / "pdf" / "final-project-report.pdf"
FONT_PATH = Path("/System/Library/Fonts/Supplemental/AppleGothic.ttf")

PAGE_WIDTH, PAGE_HEIGHT = A4
MARGIN_X = 14 * mm
MARGIN_TOP = 13 * mm
MARGIN_BOTTOM = 12 * mm
CONTENT_WIDTH = PAGE_WIDTH - 2 * MARGIN_X

INK = colors.HexColor("#211F1C")
ACCENT = colors.HexColor("#F04424")
SURFACE = colors.HexColor("#F5F2EB")
MUTED = colors.HexColor("#6F6A63")
LINE = colors.HexColor("#DED9D0")
SOFT_ORANGE = colors.HexColor("#FFF0E8")
SOFT_GREEN = colors.HexColor("#EAF7F0")


def register_fonts() -> None:
    if not FONT_PATH.exists():
        raise FileNotFoundError(f"Korean font not found: {FONT_PATH}")
    pdfmetrics.registerFont(TTFont("AppleGothic", str(FONT_PATH)))
    pdfmetrics.registerFontFamily(
        "AppleGothic",
        normal="AppleGothic",
        bold="AppleGothic",
        italic="AppleGothic",
        boldItalic="AppleGothic",
    )


class ERDiagram(Flowable):
    def __init__(self, width: float, height: float = 145) -> None:
        super().__init__()
        self.width = width
        self.height = height

    def wrap(self, available_width: float, available_height: float):
        return self.width, self.height

    def draw(self) -> None:
        canvas = self.canv
        box_width = 108
        box_height = 31
        positions = {
            "users": (0, 103),
            "sessions": (0, 48),
            "restaurants": (188, 103),
            "menu_items": (188, 48),
            "orders": (376, 103),
            "order_items": (376, 48),
            "order_status_history": (376, 0),
        }

        canvas.saveState()
        canvas.setStrokeColor(LINE)
        canvas.setLineWidth(1.1)

        relationships = [
            [(54, 103), (54, 79)],
            [(108, 118.5), (122, 118.5), (122, 141), (430, 141), (430, 134)],
            [(242, 103), (242, 79)],
            [(296, 118.5), (376, 118.5)],
            [(430, 103), (430, 79)],
            [(484, 118.5), (499, 118.5), (499, 15.5), (484, 15.5)],
            [(296, 63.5), (376, 63.5)],
        ]
        for points in relationships:
            path = canvas.beginPath()
            path.moveTo(*points[0])
            for point in points[1:]:
                path.lineTo(*point)
            canvas.drawPath(path, fill=0, stroke=1)
            x2, y2 = points[-1]
            canvas.setFillColor(ACCENT)
            canvas.circle(x2, y2, 2.2, fill=1, stroke=0)

        for name, (x, y) in positions.items():
            fill = SOFT_ORANGE if name in {"orders", "order_items"} else colors.white
            canvas.setFillColor(fill)
            canvas.setStrokeColor(ACCENT if name in {"orders", "order_items"} else LINE)
            canvas.roundRect(x, y, box_width, box_height, 7, fill=1, stroke=1)
            canvas.setFillColor(INK)
            canvas.setFont("AppleGothic", 7.7 if name == "order_status_history" else 8.6)
            canvas.drawCentredString(x + box_width / 2, y + 11, name)

        canvas.restoreState()


class SaveFlow(Flowable):
    def __init__(self, width: float, height: float = 44) -> None:
        super().__init__()
        self.width = width
        self.height = height

    def wrap(self, available_width: float, available_height: float):
        return self.width, self.height

    def draw(self) -> None:
        canvas = self.canv
        labels = ["권한 확인", "DB 재조회", "서버 재계산", "트랜잭션 저장", "커밋 / 롤백"]
        gap = 7
        box_width = (self.width - gap * (len(labels) - 1)) / len(labels)
        canvas.saveState()
        for index, label in enumerate(labels):
            x = index * (box_width + gap)
            canvas.setFillColor(SOFT_ORANGE if index == 3 else SURFACE)
            canvas.setStrokeColor(ACCENT if index == 3 else LINE)
            canvas.roundRect(x, 8, box_width, 27, 6, fill=1, stroke=1)
            canvas.setFillColor(INK)
            canvas.setFont("AppleGothic", 7.5)
            canvas.drawCentredString(x + box_width / 2, 18, label)
            if index < len(labels) - 1:
                canvas.setFillColor(ACCENT)
                canvas.setFont("AppleGothic", 8)
                canvas.drawString(x + box_width + 1.6, 18, "→")
        canvas.restoreState()


def footer(canvas, document) -> None:
    canvas.saveState()
    canvas.setStrokeColor(LINE)
    canvas.line(MARGIN_X, 8 * mm, PAGE_WIDTH - MARGIN_X, 8 * mm)
    canvas.setFillColor(MUTED)
    canvas.setFont("AppleGothic", 7.5)
    canvas.drawString(MARGIN_X, 4.7 * mm, "동네한입 · 기말 프로젝트 최종 보고서")
    canvas.drawRightString(
        PAGE_WIDTH - MARGIN_X,
        4.7 * mm,
        f"{document.page} / 2",
    )
    canvas.restoreState()


def build_styles():
    base = getSampleStyleSheet()
    return {
        "title": ParagraphStyle(
            "TitleKR",
            parent=base["Title"],
            fontName="AppleGothic",
            fontSize=22,
            leading=27,
            textColor=INK,
            alignment=TA_LEFT,
            spaceAfter=4,
        ),
        "kicker": ParagraphStyle(
            "Kicker",
            parent=base["Normal"],
            fontName="AppleGothic",
            fontSize=7.5,
            leading=10,
            textColor=ACCENT,
            spaceAfter=3,
        ),
        "h2": ParagraphStyle(
            "Heading2KR",
            parent=base["Heading2"],
            fontName="AppleGothic",
            fontSize=12.5,
            leading=16,
            textColor=INK,
            spaceBefore=6,
            spaceAfter=5,
        ),
        "h3": ParagraphStyle(
            "Heading3KR",
            parent=base["Heading3"],
            fontName="AppleGothic",
            fontSize=9.3,
            leading=12,
            textColor=INK,
            spaceAfter=3,
        ),
        "body": ParagraphStyle(
            "BodyKR",
            parent=base["BodyText"],
            fontName="AppleGothic",
            fontSize=8.2,
            leading=12.3,
            textColor=INK,
            wordWrap="CJK",
            spaceAfter=3,
        ),
        "small": ParagraphStyle(
            "SmallKR",
            parent=base["BodyText"],
            fontName="AppleGothic",
            fontSize=7.3,
            leading=10.5,
            textColor=MUTED,
            wordWrap="CJK",
        ),
        "table": ParagraphStyle(
            "TableKR",
            parent=base["BodyText"],
            fontName="AppleGothic",
            fontSize=7.1,
            leading=9.2,
            textColor=INK,
            wordWrap="CJK",
        ),
        "table_head": ParagraphStyle(
            "TableHeadKR",
            parent=base["BodyText"],
            fontName="AppleGothic",
            fontSize=7.2,
            leading=9.5,
            textColor=colors.white,
            alignment=TA_CENTER,
        ),
        "link": ParagraphStyle(
            "LinkKR",
            parent=base["BodyText"],
            fontName="AppleGothic",
            fontSize=7.8,
            leading=11,
            textColor=MUTED,
            wordWrap="CJK",
        ),
        "card": ParagraphStyle(
            "CardKR",
            parent=base["BodyText"],
            fontName="AppleGothic",
            fontSize=7.7,
            leading=11.2,
            textColor=INK,
            wordWrap="CJK",
        ),
    }


def bug_card(number: str, title: str, symptom: str, cause: str, fix: str, styles):
    rows = [
        [
            Paragraph(
                f'<font color="#F04424">{number}</font>  {title}',
                styles["h3"],
            )
        ],
        [
            Paragraph(
                f"<font color='#6F6A63'>증상</font>  {symptom}<br/>"
                f"<font color='#6F6A63'>원인</font>  {cause}<br/>"
                f"<font color='#6F6A63'>해결·검증</font>  {fix}",
                styles["card"],
            )
        ],
    ]
    table = Table(rows, colWidths=[CONTENT_WIDTH - 18], hAlign="LEFT")
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), colors.white),
                ("BOX", (0, 0), (-1, -1), 0.7, LINE),
                ("LINEBELOW", (0, 0), (-1, 0), 0.5, LINE),
                ("LEFTPADDING", (0, 0), (-1, -1), 9),
                ("RIGHTPADDING", (0, 0), (-1, -1), 9),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ]
        )
    )
    return KeepTogether([table, Spacer(1, 6)])


def make_story(styles):
    p = lambda text, style="body": Paragraph(text, styles[style])

    role_rows = [
        [p("테이블", "table_head"), p("한 줄 역할", "table_head")],
        [p("users", "table"), p("이메일, 비밀번호 해시, 고객·관리자 역할", "table")],
        [p("sessions", "table"), p("해시한 로그인 토큰과 만료 시각", "table")],
        [p("restaurants", "table"), p("식당 정보, 배달비, 최소 주문 금액", "table")],
        [p("menu_items", "table"), p("식당별 현재 메뉴, 가격, 품절 여부", "table")],
        [p("orders", "table"), p("주문자·식당·배송지·상태·총액·중복 방지 키", "table")],
        [p("order_items", "table"), p("주문 당시 메뉴명·단가 스냅샷과 수량", "table")],
        [p("order_status_history", "table"), p("상태 변경 시각·변경자·메모 누적", "table")],
    ]
    roles = Table(role_rows, colWidths=[38 * mm, CONTENT_WIDTH - 38 * mm])
    roles.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), INK),
                ("GRID", (0, 0), (-1, -1), 0.45, LINE),
                ("BACKGROUND", (0, 1), (-1, -1), colors.white),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("LEFTPADDING", (0, 0), (-1, -1), 6),
                ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                ("TOPPADDING", (0, 0), (-1, -1), 3.5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 3.5),
            ]
        )
    )

    technology = Table(
        [[p("Next.js App Router  ·  TypeScript  ·  PostgreSQL / Neon  ·  Drizzle ORM  ·  Playwright", "small")]],
        colWidths=[CONTENT_WIDTH],
    )
    technology.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), SURFACE),
                ("BOX", (0, 0), (-1, -1), 0.6, LINE),
                ("LEFTPADDING", (0, 0), (-1, -1), 9),
                ("RIGHTPADDING", (0, 0), (-1, -1), 9),
                ("TOPPADDING", (0, 0), (-1, -1), 5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ]
        )
    )

    story = [
        p("FINAL PROJECT · DELIVERY APP", "kicker"),
        p("동네한입 — 기말 프로젝트 최종 보고서", "title"),
        p(
            '<link href="https://dongne-hanip-kohl.vercel.app" color="#F04424">운영 URL  dongne-hanip-kohl.vercel.app</link>'
            '   ·   <link href="https://github.com/sieuno3o/delivery-app-final-project" color="#F04424">GitHub  sieuno3o/delivery-app-final-project</link>',
            "link",
        ),
        Spacer(1, 6),
        technology,
        p("1. 데이터베이스 구조와 설계 이유", "h2"),
        ERDiagram(CONTENT_WIDTH),
        Spacer(1, 2),
        roles,
        p("왜 이렇게 나눴는가", "h2"),
        p(
            "• <b>주문과 메뉴:</b> 한 주문에 여러 메뉴가 들어가므로 공통값은 <font color='#F04424'>orders</font>, 반복값은 <font color='#F04424'>order_items</font>로 분리했다. 주문 당시 이름·단가를 스냅샷으로 남겨 메뉴 수정·삭제 후에도 과거 기록을 보존한다.<br/>"
            "• <b>현재 상태와 이력:</b> 빠른 목록 조회는 <font color='#F04424'>orders.status</font>, 모든 변경 과정은 <font color='#F04424'>order_status_history</font>에 누적한다.<br/>"
            "• <b>계정과 세션:</b> 여러 기기 로그인을 허용하고 DB에는 세션 원문 대신 해시만 저장한다.",
            "body",
        ),
        p("주문 저장 흐름", "h3"),
        SaveFlow(CONTENT_WIDTH),
        p(
            "가격·품절·최소 주문 금액과 합계는 서버가 다시 검증한다. orders, order_items, 최초 상태 이력은 한 트랜잭션으로 저장해 실패 시 전부 롤백한다. UUID 요청 키의 고유 제약으로 중복 클릭도 한 주문만 남긴다.",
            "small",
        ),
        PageBreak(),
        p("PROBLEMS, VERIFICATION & LIMITS", "kicker"),
        p("2. 직접 겪고 해결한 문제 3개", "title"),
        bug_card(
            "BUG-004 · 영상 설명 버그",
            "검은 링크 버튼의 글자가 보이지 않음",
            "회원가입·식당 둘러보기 링크의 배경과 글자가 모두 검게 계산됐다.",
            "레이어 밖 전역 a { color: inherit }가 Tailwind @layer utilities의 text-white보다 캐스케이드에서 우선했다.",
            "불필요한 전역 a 규칙을 제거했다. getComputedStyle 색상이 rgb(33,31,28) → rgb(255,255,255)로 바뀌고 실제 화면에서도 확인했다.",
            styles,
        ),
        bug_card(
            "BUG-005",
            "주문 완료 안내가 즉시 사라짐",
            "주문 저장은 성공했지만 ‘주문이 접수됐어요!’ 안내가 거의 즉시 일반 상세로 바뀌었다.",
            "장바구니 초기화 효과의 router.replace가 서버 컴포넌트를 다시 렌더링하며 placed=1 완료 조건을 제거했다.",
            "history.replaceState로 주소만 정리했다. 현재 완료 화면은 유지되고 새로고침할 때만 일반 상세가 열리는지 실제 주문으로 검증했다.",
            styles,
        ),
        bug_card(
            "BUG-006",
            "운영 주문 시간이 한국 시간보다 9시간 느림",
            "로컬은 한국 시간, Vercel은 같은 주문을 9시간 전으로 표시했다.",
            "timestamptz UTC 저장은 정상이지만 Intl.DateTimeFormat이 실행 서버의 기본 시간대에 의존했다.",
            "모든 주문 날짜에 timeZone: Asia/Seoul을 명시하고 운영 재배포 후 동일 주문의 한국 시간 표시를 확인했다.",
            styles,
        ),
        p("3. 검증 결과", "h2"),
        Table(
            [
                [p("자동 검사", "table"), p("ESLint · TypeScript · 프로덕션 빌드", "table")],
                [p("단위·권한", "table"), p("Vitest 28개: 계산, 인증, 권한, 상태 전이, 필터", "table")],
                [p("실제 Chrome E2E", "table"), p("가입 → 주문 → 관리자 조리 중 변경 → 고객 확인, 검색·필터, 360px 레이아웃", "table")],
            ],
            colWidths=[35 * mm, CONTENT_WIDTH - 35 * mm],
            style=TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, -1), SOFT_GREEN),
                    ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#C8E6D4")),
                    ("LEFTPADDING", (0, 0), (-1, -1), 7),
                    ("RIGHTPADDING", (0, 0), (-1, -1), 7),
                    ("TOPPADDING", (0, 0), (-1, -1), 4),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                ]
            ),
        ),
        p("4. AI 활용의 한계와 남은 제약", "h2"),
        p(
            "AI의 코드 제안은 그대로 신뢰하지 않고 계산 테스트, 권한 테스트, 실제 브라우저와 운영 DB로 다시 검증했다. 실제 결제·이메일 인증·실시간 배달 위치는 외부 서비스의 보안·비용 범위 때문에 시연용 주문 저장과 상태 타임라인으로 제한했다. 물리 기기의 모바일 네트워크 점검, 10분 영상 녹화와 e-class 제출은 자동화할 수 없어 최종 단계에서 직접 수행해야 한다.",
            "body",
        ),
        Table(
            [[p("핵심 배움", "table"), p("화면 기능보다 데이터가 왜 나뉘는지, 실패할 때 트랜잭션과 제약으로 어떻게 일관성을 지키는지가 중요했다.", "table")]],
            colWidths=[30 * mm, CONTENT_WIDTH - 30 * mm],
            style=TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, -1), SOFT_ORANGE),
                    ("BOX", (0, 0), (-1, -1), 0.6, ACCENT),
                    ("LEFTPADDING", (0, 0), (-1, -1), 8),
                    ("RIGHTPADDING", (0, 0), (-1, -1), 8),
                    ("TOPPADDING", (0, 0), (-1, -1), 6),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
                ]
            ),
        ),
    ]
    return story


def main() -> None:
    register_fonts()
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    styles = build_styles()
    document = SimpleDocTemplate(
        str(OUTPUT),
        pagesize=A4,
        leftMargin=MARGIN_X,
        rightMargin=MARGIN_X,
        topMargin=MARGIN_TOP,
        bottomMargin=MARGIN_BOTTOM,
        title="동네한입 기말 프로젝트 최종 보고서",
        author="김시은",
        subject="배달앱 데이터베이스 구조, 버그 해결, 검증 결과",
    )
    document.build(make_story(styles), onFirstPage=footer, onLaterPages=footer)
    print(OUTPUT)


if __name__ == "__main__":
    main()
