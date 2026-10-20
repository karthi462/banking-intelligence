import os
import pptx
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

def create_deck():
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    # Color Palette Definitions
    DARK_BG = RGBColor(7, 13, 31)         # #070D1F (Deep Navy)
    CARD_DARK = RGBColor(15, 23, 42)      # #0F172A (Navy Slate)
    LIGHT_BG = RGBColor(248, 250, 252)    # #F8FAFC (Clean Light Grey)
    WHITE = RGBColor(255, 255, 255)
    NAVY_TEXT = RGBColor(15, 23, 42)      # #0F172A
    SLATE_MUTED = RGBColor(100, 116, 139) # #64748B
    SLATE_LIGHT = RGBColor(226, 232, 240) # #E2E8F0
    BLUE_ACCENT = RGBColor(37, 99, 235)   # #2563EB
    TEAL_ACCENT = RGBColor(13, 148, 136)  # #0D9488
    CYAN_ACCENT = RGBColor(56, 189, 248)  # #38BDF8
    AMBER_ACCENT = RGBColor(217, 119, 6)  # #D97706
    EMERALD_ACCENT = RGBColor(16, 185, 129) # #10B981

    screenshots_dir = os.path.abspath("screenshots")

    # Helper: Set slide background color
    def set_slide_background(slide, color):
        background = slide.background
        fill = background.fill
        fill.solid()
        fill.fore_color.rgb = color

    # Helper: Add header on content slides
    def add_header(slide, title_text, category_text, current_slide_num, total_slides=18):
        # Header banner card
        banner = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.6), Inches(0.4), Inches(12.133), Inches(0.95))
        banner.fill.solid()
        banner.fill.fore_color.rgb = WHITE
        banner.line.color.rgb = SLATE_LIGHT
        banner.line.width = Pt(1)

        # Category pill / badge
        cat_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.5), Inches(7.5), Inches(0.3))
        tf_cat = cat_box.text_frame
        tf_cat.word_wrap = True
        p_cat = tf_cat.paragraphs[0]
        p_cat.text = f"APEX BANK • {category_text.upper()}"
        p_cat.font.size = Pt(9.5)
        p_cat.font.bold = True
        p_cat.font.color.rgb = TEAL_ACCENT

        # Title
        title_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.75), Inches(8.5), Inches(0.55))
        tf_title = title_box.text_frame
        p_title = tf_title.paragraphs[0]
        p_title.text = title_text
        p_title.font.size = Pt(18)
        p_title.font.bold = True
        p_title.font.color.rgb = NAVY_TEXT

        # Slide Number Badge on Right
        num_box = slide.shapes.add_textbox(Inches(10.5), Inches(0.65), Inches(2.0), Inches(0.4))
        tf_num = num_box.text_frame
        p_num = tf_num.paragraphs[0]
        p_num.alignment = PP_ALIGN.RIGHT
        p_num.text = f"{current_slide_num:02d} / {total_slides:02d}"
        p_num.font.size = Pt(12)
        p_num.font.bold = True
        p_num.font.color.rgb = SLATE_MUTED

    # =========================================================================
    # SLIDE 1: TITLE / FRONT PAGE
    # =========================================================================
    s1 = prs.slides.add_slide(blank_layout)
    set_slide_background(s1, DARK_BG)

    # Decorative background shapes
    glow = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(0.6), Inches(11.733), Inches(6.3))
    glow.fill.solid()
    glow.fill.fore_color.rgb = CARD_DARK
    glow.line.color.rgb = RGBColor(30, 41, 59)
    glow.line.width = Pt(1.5)

    # Badge: Academic Subject
    badge = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.3), Inches(1.0), Inches(4.8), Inches(0.45))
    badge.fill.solid()
    badge.fill.fore_color.rgb = RGBColor(6, 78, 59)
    badge.line.color.rgb = RGBColor(16, 185, 129)
    badge.line.width = Pt(1)
    tf_b = badge.text_frame
    p_b = tf_b.paragraphs[0]
    p_b.text = "★ ADVANCED DATA VISUALIZATION (ADVT) PROJECT"
    p_b.font.size = Pt(10.5)
    p_b.font.bold = True
    p_b.font.color.rgb = RGBColor(52, 211, 153)
    p_b.alignment = PP_ALIGN.CENTER

    # Main Project Title
    tbox = s1.shapes.add_textbox(Inches(1.2), Inches(1.6), Inches(10.5), Inches(1.3))
    tf_t = tbox.text_frame
    tf_t.word_wrap = True
    p_t = tf_t.paragraphs[0]
    p_t.text = "Banking Transaction Intelligence Dashboard"
    p_t.font.size = Pt(32)
    p_t.font.bold = True
    p_t.font.color.rgb = WHITE

    # Subtitle
    stbox = s1.shapes.add_textbox(Inches(1.2), Inches(2.9), Inches(10.5), Inches(0.9))
    tf_st = stbox.text_frame
    tf_st.word_wrap = True
    p_st = tf_st.paragraphs[0]
    p_st.text = "Advanced Time-Series Financial Analytics, Non-Parametric Anomaly Detection & Predictive Multi-Channel Forecasting Using R, Python (FastAPI), and React 19"
    p_st.font.size = Pt(14)
    p_st.font.color.rgb = CYAN_ACCENT

    # Student & Project Details Card
    info_card = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.3), Inches(4.0), Inches(10.7), Inches(2.4))
    info_card.fill.solid()
    info_card.fill.fore_color.rgb = RGBColor(11, 18, 38)
    info_card.line.color.rgb = RGBColor(51, 65, 85)
    info_card.line.width = Pt(1)

    # 3 Column metadata inside the card
    col1 = s1.shapes.add_textbox(Inches(1.6), Inches(4.2), Inches(3.4), Inches(2.0))
    tf1 = col1.text_frame
    tf1.word_wrap = True
    p = tf1.paragraphs[0]
    p.text = "CANDIDATE DETAILS"
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = TEAL_ACCENT
    items1 = [
        ("Student Name:", "Karthick M"),
        ("Register Number:", "21BCE0000 / [Your Reg No]"),
        ("Degree & Branch:", "B.Tech Computer Science & Engg"),
    ]
    for label, val in items1:
        p_sub = tf1.add_paragraph()
        p_sub.text = f"{label} "
        p_sub.font.size = Pt(11)
        p_sub.font.bold = True
        p_sub.font.color.rgb = WHITE
        run = p_sub.add_run()
        run.text = val
        run.font.bold = False
        run.font.color.rgb = RGBColor(203, 213, 225)

    col2 = s1.shapes.add_textbox(Inches(5.2), Inches(4.2), Inches(3.4), Inches(2.0))
    tf2 = col2.text_frame
    tf2.word_wrap = True
    p = tf2.paragraphs[0]
    p.text = "COURSE & INSTITUTION"
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = TEAL_ACCENT
    items2 = [
        ("Course Name:", "Advanced Data Visualization"),
        ("Course Code:", "CSE / ADVT Capstone Project"),
        ("Institution:", "School of Computer Science"),
    ]
    for label, val in items2:
        p_sub = tf2.add_paragraph()
        p_sub.text = f"{label} "
        p_sub.font.size = Pt(11)
        p_sub.font.bold = True
        p_sub.font.color.rgb = WHITE
        run = p_sub.add_run()
        run.text = val
        run.font.bold = False
        run.font.color.rgb = RGBColor(203, 213, 225)

    col3 = s1.shapes.add_textbox(Inches(8.8), Inches(4.2), Inches(3.0), Inches(2.0))
    tf3 = col3.text_frame
    tf3.word_wrap = True
    p = tf3.paragraphs[0]
    p.text = "TECHNOLOGY STACK"
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = TEAL_ACCENT
    items3 = [
        ("Frontend UI:", "React 19, TypeScript, Vite"),
        ("Backend Engine:", "FastAPI, Pandas, Statsmodels"),
        ("R Analytics:", "ggplot2, forecast, plotly"),
    ]
    for label, val in items3:
        p_sub = tf3.add_paragraph()
        p_sub.text = f"{label} "
        p_sub.font.size = Pt(11)
        p_sub.font.bold = True
        p_sub.font.color.rgb = WHITE
        run = p_sub.add_run()
        run.text = val
        run.font.bold = False
        run.font.color.rgb = RGBColor(203, 213, 225)

    # =========================================================================
    # SLIDE 2: INDEX / TABLE OF CONTENTS
    # =========================================================================
    s2 = prs.slides.add_slide(blank_layout)
    set_slide_background(s2, LIGHT_BG)
    add_header(s2, "Table of Contents & Project Agenda", "Presentation Overview", 2)

    index_sections = [
        ("01", "Project Motivation & Objectives", "Financial trends, transaction surges & anomaly challenges", BLUE_ACCENT),
        ("02", "System Architecture & Tech Stack", "Modern 3-tier design: React 19, FastAPI, & R analytical suite", TEAL_ACCENT),
        ("03", "Data Schema & Quality Audit Engine", "15,004 verified records, diurnal curves & null validation", BLUE_ACCENT),
        ("04", "Welcome Portal & Bank Personas", "Multi-role clearance: Corporate, Savings, Audit, Executive", TEAL_ACCENT),
        ("05", "Dashboard Home & Financial KPIs", "Live KPI cards, volume progression & Indian numbering", BLUE_ACCENT),
        ("06", "Moving Average Trends & Smoothing", "7-day & 30-day rolling filters, cumulative trajectories", TEAL_ACCENT),
        ("07", "24x7 Diurnal & Peak Hour Heatmaps", "Hour-of-day vs Day-of-week matrix, lunch/evening surges", BLUE_ACCENT),
        ("08", "Payment Channel Analytics", "UPI, ATM, Debit, Credit & Transfers volume & failure rate", TEAL_ACCENT),
        ("09", "Statistical Anomaly Detection", "Non-parametric MAD & IQR fences without mislabeling fraud", BLUE_ACCENT),
        ("10", "Predictive Time-Series Forecasting", "14-day Holt-Winters & SARIMAX chronological backtesting", TEAL_ACCENT),
        ("11", "Multi-Branch Operations & Metros", "6 Metro centers benchmarked across ticket sizes & volume", BLUE_ACCENT),
        ("12", "Dataset Explorer & CSV Ingestion", "Interactive drag-and-drop ingestion & schema mapping", TEAL_ACCENT),
        ("13", "Executive PDF & CSV Export", "ReportLab automated reports & raw data filter exports", BLUE_ACCENT),
        ("14", "Academic R Programming Suite", "ggplot2, forecast, and seasonal STL decomposition", TEAL_ACCENT),
        ("15", "Deployment, CI/CD & Conclusion", "Render, Docker, GitHub Actions & academic outcomes", BLUE_ACCENT),
    ]

    for idx, (num, title, desc, col) in enumerate(index_sections):
        # 3 columns x 5 rows
        r = idx % 5
        c = idx // 5
        x = Inches(0.6 + c * 4.1)
        y = Inches(1.6 + r * 1.1)

        card = s2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, y, Inches(3.95), Inches(0.95))
        card.fill.solid()
        card.fill.fore_color.rgb = WHITE
        card.line.color.rgb = SLATE_LIGHT
        card.line.width = Pt(1)

        # Number pill
        pill = s2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x + Inches(0.12), y + Inches(0.15), Inches(0.48), Inches(0.65))
        pill.fill.solid()
        pill.fill.fore_color.rgb = col
        pill.line.fill.background()
        tf_p = pill.text_frame
        p = tf_p.paragraphs[0]
        p.text = num
        p.font.size = Pt(12)
        p.font.bold = True
        p.font.color.rgb = WHITE
        p.alignment = PP_ALIGN.CENTER

        # Title & desc
        tbox = s2.shapes.add_textbox(x + Inches(0.68), y + Inches(0.1), Inches(3.15), Inches(0.75))
        tf = tbox.text_frame
        tf.word_wrap = True
        p_t = tf.paragraphs[0]
        p_t.text = title
        p_t.font.size = Pt(11)
        p_t.font.bold = True
        p_t.font.color.rgb = NAVY_TEXT

        p_d = tf.add_paragraph()
        p_d.text = desc
        p_d.font.size = Pt(9)
        p_d.font.color.rgb = SLATE_MUTED

    # =========================================================================
    # SLIDE 3: PROJECT MOTIVATION & OBJECTIVES
    # =========================================================================
    s3 = prs.slides.add_slide(blank_layout)
    set_slide_background(s3, LIGHT_BG)
    add_header(s3, "Project Motivation & Problem Statement", "Research & Analytical Background", 3)

    # 3 Big Thematic Cards
    pillars = [
        ("The Modern Banking Surge", "Exponential Volume & Channel Velocity",
         ["Over 80% of routine retail transactions in India happen through UPI & mobile gateways.",
          "High transaction velocity creates severe server switch strain during 12–2 PM lunch & 6–8 PM evening peak.",
          "Conventional static dashboards fail to capture diurnal intra-day surges and intra-week rhythm.",
          "Need for advanced temporal heatmaps and moving average smoothing filters to reveal systemic liquidity."],
         BLUE_ACCENT),
        ("The Fraud vs Anomaly Dilemma", "Responsible Non-Parametric Risk Scoring",
         ["High-value transfers (e.g. corporate salary disbursal, property advance) are often falsely flagged as fraud.",
          "Financial data exhibits severe right-skewness and fat-tailed distributions, breaking normal distribution assumptions.",
          "Project enforces robust Median Absolute Deviation (MAD) & Interquartile Range (IQR) fences.",
          "Strict academic principle: Distinguish statistical outliers from confirmed fraud without prejudice."],
         TEAL_ACCENT),
        ("Academic Deliverables & Vision", "End-to-End Advanced Data Visualization",
         ["Demonstrate rigorous time-series methodologies: 7d/30d Rolling MA, STL decomposition, Holt-Winters.",
          "Dual-engine architecture: Python FastAPI for web interactivity + R (ggplot2, forecast) for statistical papers.",
          "Enterprise persona authentication allowing role-based access for Corporate, Branch, Audit & Executive.",
          "Production-ready deployment via Docker, GitHub Actions CI/CD, and Render cloud web services."],
         AMBER_ACCENT),
    ]

    for idx, (title, subtitle, bullets, col) in enumerate(pillars):
        x = Inches(0.6 + idx * 4.1)
        y = Inches(1.6)
        card = s3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, y, Inches(3.95), Inches(5.3))
        card.fill.solid()
        card.fill.fore_color.rgb = WHITE
        card.line.color.rgb = SLATE_LIGHT
        card.line.width = Pt(1.5)

        # Top banner
        top_bar = s3.shapes.add_shape(MSO_SHAPE.RECTANGLE, x, y, Inches(3.95), Inches(0.65))
        top_bar.fill.solid()
        top_bar.fill.fore_color.rgb = col
        top_bar.line.fill.background()
        tf_tb = top_bar.text_frame
        p = tf_tb.paragraphs[0]
        p.text = title
        p.font.size = Pt(13)
        p.font.bold = True
        p.font.color.rgb = WHITE
        p.alignment = PP_ALIGN.CENTER

        # Body text
        bbox = s3.shapes.add_textbox(x + Inches(0.2), y + Inches(0.8), Inches(3.55), Inches(4.3))
        tf = bbox.text_frame
        tf.word_wrap = True
        p_sub = tf.paragraphs[0]
        p_sub.text = subtitle.upper()
        p_sub.font.size = Pt(10)
        p_sub.font.bold = True
        p_sub.font.color.rgb = col

        for bullet in bullets:
            p_b = tf.add_paragraph()
            p_b.text = f"• {bullet}"
            p_b.font.size = Pt(10)
            p_b.font.color.rgb = NAVY_TEXT
            p_b.space_before = Pt(8)

    # =========================================================================
    # SLIDE 4: SYSTEM ARCHITECTURE & TECH STACK
    # =========================================================================
    s4 = prs.slides.add_slide(blank_layout)
    set_slide_background(s4, LIGHT_BG)
    add_header(s4, "Enterprise System Architecture & Multi-Tier Stack", "System Design", 4)

    tiers = [
        ("TIER 1: FRONTEND CLIENT", "React 19 & TypeScript",
         [("React 19 & Vite 8", "Next-gen lightning bundler with instant HMR and optimized tree-shaking."),
          ("Tailwind CSS v4 & Lucide", "Precision design system with custom financial SaaS tokens and icons."),
          ("Recharts & Plotly.js", "Interactive SVG/Canvas time-series charts, dual axes, and tooltips."),
          ("React Router v7", "Single Page Application client-side routing with deep link fallback."),
          ("Auth & Filter Contexts", "Reactive multi-role persona switcher and synchronized global filter state.")],
         BLUE_ACCENT),
        ("TIER 2: ANALYTICS BACKEND", "FastAPI & Python 3.14",
         [("FastAPI Async REST API", "High-throughput asynchronous ASGI microservice with automatic OpenAPI docs."),
          ("Pandas & NumPy", "Vectorized time-series aggregation, rolling window rolling(), and resampling."),
          ("Statsmodels & SciPy", "Holt-Winters exponential smoothing, seasonal decompose(), and MAD fences."),
          ("ReportLab Engine", "Dynamic server-side PDF generator producing executive multi-page reports."),
          ("Dataset Quality Service", "Automated CSV ingestion, column mapping, fence checks, and rejection audit.")],
         TEAL_ACCENT),
        ("TIER 3: R & INFRASTRUCTURE", "R Statistical Suite & DevOps",
         [("R Programming Scripts", "Independent statistical visualization pipeline using ggplot2, plotly, and zoo."),
          ("Forecast & Lubridate", "ARIMA and ETS modeling with seasonal frequency decomposition."),
          ("Docker & Compose", "Multi-stage alpine/slim containerization for reproducible deployments."),
          ("GitHub Actions CI/CD", "Automated GitHub workflow verifying 12 unit tests and Vite build."),
          ("Cloud Hosting (Render)", "Unified production deployment with static assets served via ASGI.")],
         EMERALD_ACCENT),
    ]

    for idx, (title, subtitle, items, col) in enumerate(tiers):
        x = Inches(0.6 + idx * 4.1)
        y = Inches(1.6)
        card = s4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, y, Inches(3.95), Inches(5.3))
        card.fill.solid()
        card.fill.fore_color.rgb = WHITE
        card.line.color.rgb = SLATE_LIGHT
        card.line.width = Pt(1.5)

        # Header
        hbar = s4.shapes.add_shape(MSO_SHAPE.RECTANGLE, x, y, Inches(3.95), Inches(0.65))
        hbar.fill.solid()
        hbar.fill.fore_color.rgb = col
        hbar.line.fill.background()
        tf = hbar.text_frame
        p = tf.paragraphs[0]
        p.text = title
        p.font.size = Pt(12)
        p.font.bold = True
        p.font.color.rgb = WHITE
        p.alignment = PP_ALIGN.CENTER

        bbox = s4.shapes.add_textbox(x + Inches(0.2), y + Inches(0.75), Inches(3.55), Inches(4.3))
        tf_b = bbox.text_frame
        tf_b.word_wrap = True
        p_sub = tf_b.paragraphs[0]
        p_sub.text = subtitle.upper()
        p_sub.font.size = Pt(10)
        p_sub.font.bold = True
        p_sub.font.color.rgb = col

        for item_t, item_d in items:
            p_i = tf_b.add_paragraph()
            p_i.text = f"• {item_t}: "
            p_i.font.size = Pt(10)
            p_i.font.bold = True
            p_i.font.color.rgb = NAVY_TEXT
            p_i.space_before = Pt(6)
            run = p_i.add_run()
            run.text = item_d
            run.font.bold = False
            run.font.color.rgb = SLATE_MUTED

    # =========================================================================
    # HELPER FUNCTION FOR SCREENSHOT SLIDES (5 to 14)
    # =========================================================================
    def add_screenshot_slide(slide_num, title, category, screenshot_file, headline, bullets, formula_or_tag):
        s = prs.slides.add_slide(blank_layout)
        set_slide_background(s, LIGHT_BG)
        add_header(s, title, category, slide_num)

        # Left Info Card (Width: 4.4 inches)
        left_card = s.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.6), Inches(1.55), Inches(4.5), Inches(5.45))
        left_card.fill.solid()
        left_card.fill.fore_color.rgb = WHITE
        left_card.line.color.rgb = SLATE_LIGHT
        left_card.line.width = Pt(1)

        # Content inside left card
        tb = s.shapes.add_textbox(Inches(0.8), Inches(1.7), Inches(4.1), Inches(4.2))
        tf = tb.text_frame
        tf.word_wrap = True

        # Headline
        p_hl = tf.paragraphs[0]
        p_hl.text = headline
        p_hl.font.size = Pt(13)
        p_hl.font.bold = True
        p_hl.font.color.rgb = BLUE_ACCENT

        # Bullets
        for b_title, b_desc in bullets:
            p = tf.add_paragraph()
            p.text = f"✔ {b_title}"
            p.font.size = Pt(11)
            p.font.bold = True
            p.font.color.rgb = NAVY_TEXT
            p.space_before = Pt(8)

            p_sub = tf.add_paragraph()
            p_sub.text = b_desc
            p_sub.font.size = Pt(9.5)
            p_sub.font.color.rgb = SLATE_MUTED
            p_sub.space_before = Pt(2)

        # Technical formula or tag callout at bottom
        tag_box = s.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(6.15), Inches(4.1), Inches(0.65))
        tag_box.fill.solid()
        tag_box.fill.fore_color.rgb = RGBColor(241, 245, 249)
        tag_box.line.color.rgb = RGBColor(203, 213, 225)
        tag_box.line.width = Pt(1)
        tf_tag = tag_box.text_frame
        p_tag = tf_tag.paragraphs[0]
        p_tag.text = formula_or_tag
        p_tag.font.size = Pt(9.5)
        p_tag.font.bold = True
        p_tag.font.color.rgb = TEAL_ACCENT
        p_tag.alignment = PP_ALIGN.CENTER

        # Right Card for Screenshot (Width: 7.4 inches, Height: 5.45 inches)
        right_card = s.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(5.3), Inches(1.55), Inches(7.433), Inches(5.45))
        right_card.fill.solid()
        right_card.fill.fore_color.rgb = CARD_DARK
        right_card.line.color.rgb = SLATE_LIGHT
        right_card.line.width = Pt(1)

        # Insert Screenshot Image
        img_path = os.path.join(screenshots_dir, screenshot_file)
        if os.path.exists(img_path):
            s.shapes.add_picture(img_path, Inches(5.4), Inches(1.65), Inches(7.233), Inches(5.25))

    # =========================================================================
    # SLIDE 5: WELCOME PORTAL & PERSONAS
    # =========================================================================
    add_screenshot_slide(
        5,
        "Interactive Welcome Portal & Bank Account Personas",
        "Identity & Access Management",
        "01_welcome_portal.png",
        "Role-Based Financial Clearance & Interactive Landing",
        [
            ("5 Pre-Configured Banking Personas", "Rajesh Sharma (Corporate Current Account), Priya Sundaram (Retail Savings), Ananya Roy (Branch Manager), Vikramaditya Rao (Risk Audit), Shashi Nair (Executive)."),
            ("Live Financial Ticker", "Displays dynamic aggregate metrics: ₹248.5 Cr volume, 15,004 verified records, 93.8% gateway velocity, and 6 regional hubs."),
            ("One-Click Context Auto-Filtering", "Selecting an account dynamically binds branch and account-type filters across all backend analytical endpoints."),
        ],
        "⚡ Authentication: JWT/Session Persona Scopes • Route: /welcome"
    )

    # =========================================================================
    # SLIDE 6: DASHBOARD OVERVIEW & KPIS
    # =========================================================================
    add_screenshot_slide(
        6,
        "Dashboard Overview & Real-Time Financial KPIs",
        "Core Analytics",
        "02_dashboard_overview.png",
        "Executive High-Level Cockpit & Live Operations",
        [
            ("6 Core Financial KPI Cards", "Total Transactions, Total Gross Value, Average Ticket Size, Success Velocity (93.8%), Failed Txn Count, and Flagged Anomalies."),
            ("Indian Currency Formatting Conventions", "Dynamic formatting converting values into ₹ Lakhs and ₹ Crores with localized commas."),
            ("Period-Over-Period Comparison", "Calculates mathematically valid percentage changes against previous equivalent time windows with zero extrapolation."),
            ("Recent Transactions Ledger", "Searchable, sortable real-time table displaying timestamp, branch, payment mode, and anomaly flags."),
        ],
        "📊 KPI Formula: Velocity = (Txn_Success / Txn_Total) × 100"
    )

    # =========================================================================
    # SLIDE 7: TRANSACTION TRENDS & MOVING AVERAGES
    # =========================================================================
    add_screenshot_slide(
        7,
        "Transaction Trends & Dual Moving Average Smoothing",
        "Time-Series Analysis",
        "03_transaction_trends.png",
        "Isolating Macroeconomic Momentum from Daily Noise",
        [
            ("Dual Moving Average Filters (7d & 30d)", "7-day rolling window isolates intra-week day-of-week noise; 30-day window reveals quarterly macroeconomic liquidity expansion."),
            ("Deposit vs Withdrawal Comparison", "Comparative area curves monitoring liquidity inflows against outflow velocity to detect net capital drain."),
            ("Cumulative Liquidity Curve", "Running cumulative sum over the filtered date range showing liquidity accumulation trajectory over 90 days."),
            ("Configurable Aggregation Granularity", "Instant toggle between Daily, Weekly, and Monthly resampling without data truncation."),
        ],
        "📈 Rolling Formula: MA_k(t) = (1/k) ∑_{i=0}^{k-1} Txn(t - i)"
    )

    # =========================================================================
    # SLIDE 8: TEMPORAL HEATMAPS & PEAK HOURS
    # =========================================================================
    add_screenshot_slide(
        8,
        "Temporal Heatmaps & 24x7 Rush Hour Analysis",
        "Diurnal Behavioral Science",
        "04_time_analysis_heatmaps.png",
        "168-Hour Weekly Matrix of Core Banking Velocity",
        [
            ("24x7 Hour × Day Heatmap Matrix", "Maps all 168 weekly hourly bins to identify peak server load: detects 12–2 PM lunch peak and 6–8 PM evening retail shopping surges."),
            ("Day-of-Week Liquidity Comparison", "Discloses weekday enterprise settlement patterns versus weekend retail micro-transaction surges."),
            ("Calendar-Style Month View", "Color-intensity calendar visualization revealing month-end salary disbursals and quarter-end corporate tax settlements."),
            ("Time-Series Decomposition (STL)", "Additive/multiplicative decomposition separating Observed = Trend + Seasonal (Diurnal) + Residual components."),
        ],
        "⏰ Matrix Dimensions: 24 Hours × 7 Days = 168 Discrete Cells"
    )

    # =========================================================================
    # SLIDE 9: PAYMENT CHANNEL ANALYTICS
    # =========================================================================
    add_screenshot_slide(
        9,
        "Payment Channel Analytics & Gateway Reliability",
        "Multi-Channel Liquidity",
        "05_payment_analytics.png",
        "Evaluating UPI, ATM, Cards & Bank Transfer Behavior",
        [
            ("Channel Volume & Value Share", "Analyzes payment modes: UPI dominates transaction count (62%), while RTGS/NEFT Bank Transfers represent the highest aggregate capital value."),
            ("Gateway Failure Velocity Analysis", "Monitors payment clearance rates to detect gateway timeouts, switch outages, and server drops by payment type."),
            ("Average Ticket Size per Mode", "Demonstrates micro-payments on UPI (avg ₹1,400) versus institutional settlement via Bank Transfer (avg ₹1,85,000)."),
            ("Temporal Channel Migration", "Evaluates historical shift from physical ATM cash withdrawals to contactless UPI payments over time."),
        ],
        "💳 Modes Evaluated: UPI • ATM • Debit Card • Credit Card • Transfer"
    )

    # =========================================================================
    # SLIDE 10: STATISTICAL ANOMALY DETECTION
    # =========================================================================
    add_screenshot_slide(
        10,
        "Statistical Anomaly Detection (MAD & IQR Fences)",
        "Risk & Compliance Surveillance",
        "06_statistical_anomalies.png",
        "Robust Non-Parametric Outlier Scoring Without Bias",
        [
            ("Fat-Tailed Financial Distribution", "Banking amounts exhibit extreme positive skewness; Gaussian 3-sigma rules fail by generating hundreds of false positives."),
            ("Median Absolute Deviation (MAD)", "Uses the median as the central location estimator and MAD as the scale estimator, making it resilient to massive outlier spikes."),
            ("Interquartile Range (IQR) Outer Fences", "Flags data points outside Q1 - 1.5×IQR and Q3 + 1.5×IQR with custom sensitivity sliders."),
            ("Strict Academic Rule: Outlier ≠ Fraud", "Explains that high-value transactions (corporate treasury, real estate) are statistical anomalies but legitimate business."),
        ],
        "🛡️ Robust Scoring: MAD = Median(|X_i - Median(X)|) • Fences: 1.5×IQR"
    )

    # =========================================================================
    # SLIDE 11: PREDICTIVE TIME-SERIES FORECASTING
    # =========================================================================
    add_screenshot_slide(
        11,
        "Predictive Time-Series Forecasting & Backtesting",
        "Machine Learning & Econometrics",
        "07_forecasting_models.png",
        "14-Day Forward Horizon with Chronological Backtesting",
        [
            ("Holt-Winters Exponential Smoothing", "Captures baseline level, linear trend progression, and weekly 7-day diurnal seasonality simultaneously."),
            ("SARIMAX Autoregressive Modeling", "Applies seasonal differencing (p,d,q)(P,D,Q)s to model autocorrelated transaction velocity."),
            ("Zero Forward-Looking Data Leakage", "Strict chronological train/test split holding out the final 14 days to benchmark genuine predictive validity."),
            ("Accuracy Metrics (MAPE & RMSE)", "Quantitative validation reporting Mean Absolute Percentage Error (MAPE < 6.8%) and 95% Confidence Intervals."),
        ],
        "🔮 Model: Holt-Winters Additive Seasonality • Horizon: 14 Days"
    )

    # =========================================================================
    # SLIDE 12: BRANCH COMPARISON & GEOGRAPHY
    # =========================================================================
    add_screenshot_slide(
        12,
        "Multi-Branch Performance & Regional Metros",
        "Geographic Operations",
        "08_branch_comparison.png",
        "Cross-Regional Performance Across 6 Commercial Hubs",
        [
            ("6 Strategic Metropolitan Hubs", "Mumbai Fort (Financial Capital), Delhi Connaught Place (North), Bengaluru Indiranagar (Tech Hub), Chennai Central (South), Hyderabad, and Kolkata."),
            ("Volume vs Value Decoupling", "Mumbai Fort exhibits largest aggregate capital value; Bengaluru leads in UPI velocity and digital channel adoption."),
            ("Deposit-to-Withdrawal Liquidity Ratio", "Monitors branch reserve health to ensure branches maintain adequate physical and digital vault liquidity."),
            ("Comparative Bar & Bubble Visualizations", "Multi-dimensional ranking across total volume, transaction counts, and average ticket size."),
        ],
        "🏢 Hubs: Mumbai Fort • Delhi CP • Bengaluru • Chennai • Hyd • Kolkata"
    )

    # =========================================================================
    # SLIDE 13: DATASET EXPLORER & INGESTION ENGINE
    # =========================================================================
    add_screenshot_slide(
        13,
        "Dataset Explorer & Dynamic Schema Mapping",
        "Data Quality Engineering",
        "09_dataset_explorer.png",
        "Self-Healing Data Ingestion & Integrity Audits",
        [
            ("Drag-and-Drop CSV Ingestion", "Upload any external real-world banking dataset; the engine automatically audits column data types and null frequencies."),
            ("Interactive Column Mapper", "Maps arbitrary uploaded column headers (e.g., 'txn_date', 'amt', 'channel') to the standardized analytical schema."),
            ("Rejection & Cleanliness Log", "Detects and quarantines corrupted rows (e.g., negative amounts, future timestamps, unparseable dates)."),
            ("15,004 Calibrated Benchmark Records", "Includes realistic pre-loaded benchmark transactions with calibrated seasonal cycles and ground-truth anomalies."),
        ],
        "📂 Quality Audit: Null Check • Range Fence • Date Validation • Schema Map"
    )

    # =========================================================================
    # SLIDE 14: EXECUTIVE REPORTING & EXPORT
    # =========================================================================
    add_screenshot_slide(
        14,
        "Executive PDF & CSV Automated Export Center",
        "Automated Reporting",
        "10_reports_export.png",
        "Publication-Ready Financial Audits & Filtered CSVs",
        [
            ("Server-Side PDF Generation (ReportLab)", "Generates a multi-page, formatted corporate executive summary with KPI cards, trend summaries, and branch breakdowns."),
            ("Context-Aware Raw CSV Data Export", "Exports filtered dataset slice with exact filter parameters applied (dates, branches, payment modes)."),
            ("Data Dictionary & Regulatory Metadata", "Includes complete statistical fences, column definitions, and calculation methodologies for compliance audit."),
            ("One-Click Download Action", "Instant asynchronous export stream directly downloadable from browser without page reload."),
        ],
        "📑 Output Formats: Executive PDF Report • Raw Analytical CSV"
    )

    # =========================================================================
    # SLIDE 15: ACADEMIC R STATISTICAL SUITE
    # =========================================================================
    s15 = prs.slides.add_slide(blank_layout)
    set_slide_background(s15, LIGHT_BG)
    add_header(s15, "Academic R Programming & Statistical Deliverables", "R Analytics Pipeline", 15)

    r_cards = [
        ("time_series_visualization.R", "ggplot2 & Plotly Time-Series",
         ["Generates dual-axis line charts comparing daily transaction counts against gross monetary volume.",
          "Implements rollmean() from the 'zoo' package to plot 7-day and 30-day moving averages.",
          "Decomposes time series using STL (Seasonal and Trend decomposition using Loess).",
          "Formats currency with scales::dollar_format() and customized Indian Rupee tick labels."],
         BLUE_ACCENT),
        ("anomaly_analysis.R", "Non-Parametric Statistical Fencing",
         ["Computes median() and mad() to construct upper and lower non-parametric fences.",
          "Visualizes anomalies as high-contrast red scatter points overlaid onto baseline distributions.",
          "Generates faceted boxplots per branch and payment mode to show variance across channels.",
          "Separates volume surge events from single large-value transactions."],
         TEAL_ACCENT),
        ("forecasting.R", "ARIMA & Exponential Smoothing",
         ["Converts daily series into ts(frequency = 7) weekly seasonal time-series objects.",
          "Fits auto.arima() and ets() (Error, Trend, Seasonal) models from the forecast package.",
          "Generates 14-day forward predictions with 80% and 95% confidence intervals.",
          "Plots backtesting forecast vs actual curves using autoplot.forecast()."],
         EMERALD_ACCENT),
    ]

    for idx, (title, subtitle, bullets, col) in enumerate(r_cards):
        x = Inches(0.6 + idx * 4.1)
        y = Inches(1.6)
        card = s15.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, y, Inches(3.95), Inches(5.3))
        card.fill.solid()
        card.fill.fore_color.rgb = WHITE
        card.line.color.rgb = SLATE_LIGHT
        card.line.width = Pt(1.5)

        hbar = s15.shapes.add_shape(MSO_SHAPE.RECTANGLE, x, y, Inches(3.95), Inches(0.65))
        hbar.fill.solid()
        hbar.fill.fore_color.rgb = col
        hbar.line.fill.background()
        tf = hbar.text_frame
        p = tf.paragraphs[0]
        p.text = title
        p.font.size = Pt(12)
        p.font.bold = True
        p.font.color.rgb = WHITE
        p.alignment = PP_ALIGN.CENTER

        bbox = s15.shapes.add_textbox(x + Inches(0.2), y + Inches(0.75), Inches(3.55), Inches(4.3))
        tf_b = bbox.text_frame
        tf_b.word_wrap = True
        p_sub = tf_b.paragraphs[0]
        p_sub.text = subtitle.upper()
        p_sub.font.size = Pt(10)
        p_sub.font.bold = True
        p_sub.font.color.rgb = col

        for bullet in bullets:
            p_b = tf_b.add_paragraph()
            p_b.text = f"• {bullet}"
            p_b.font.size = Pt(10)
            p_b.font.color.rgb = NAVY_TEXT
            p_b.space_before = Pt(8)

    # =========================================================================
    # SLIDE 16: DEPLOYMENT, CI/CD & REPRODUCIBILITY
    # =========================================================================
    s16 = prs.slides.add_slide(blank_layout)
    set_slide_background(s16, LIGHT_BG)
    add_header(s16, "Cloud Deployment, CI/CD & One-Click Reproducibility", "DevOps & Production", 16)

    devops_pillars = [
        ("Automated CI/CD Pipeline", "GitHub Actions (.github/workflows/ci.yml)",
         [("12 Unit & Integration Tests", "Pytest suite verifying KPIs, moving averages, diurnal matrix, and MAD fences with 100% pass rate in 18s."),
          ("Production Frontend Build", "Vite 8 & TypeScript compilation transforming 2,520 modules with zero lint or type errors."),
          ("Automated Code Quality", "Validates requirements.txt, Python 3.11/3.14 environments, and dependencies.")],
         BLUE_ACCENT),
        ("One-Click Local Launchers", "Zero-Configuration Windows Scripts",
         [("run_dashboard.bat", "Double-click batch launcher starting FastAPI backend & React frontend, auto-opening default browser."),
          ("run_dashboard.ps1", "PowerShell runner with colored log monitoring and port collision checks."),
          ("run_tests.bat & run_r.bat", "Instant one-click test execution and R analysis pipeline triggers.")],
         TEAL_ACCENT),
        ("Containerization & Cloud", "Docker, Docker Compose & Render",
         [("Unified Dockerfile", "Multi-stage python:3.11-slim container packaging backend, data, and docs."),
          ("docker-compose.yml", "Full-stack orchestration exposing backend on 8000 and frontend on 5173."),
          ("Render Cloud Web Service", "Live cloud deployment at banking-intelligence-1.onrender.com with unified static serving.")],
         EMERALD_ACCENT),
    ]

    for idx, (title, subtitle, items, col) in enumerate(devops_pillars):
        x = Inches(0.6 + idx * 4.1)
        y = Inches(1.6)
        card = s16.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, y, Inches(3.95), Inches(5.3))
        card.fill.solid()
        card.fill.fore_color.rgb = WHITE
        card.line.color.rgb = SLATE_LIGHT
        card.line.width = Pt(1.5)

        hbar = s16.shapes.add_shape(MSO_SHAPE.RECTANGLE, x, y, Inches(3.95), Inches(0.65))
        hbar.fill.solid()
        hbar.fill.fore_color.rgb = col
        hbar.line.fill.background()
        tf = hbar.text_frame
        p = tf.paragraphs[0]
        p.text = title
        p.font.size = Pt(12)
        p.font.bold = True
        p.font.color.rgb = WHITE
        p.alignment = PP_ALIGN.CENTER

        bbox = s16.shapes.add_textbox(x + Inches(0.2), y + Inches(0.75), Inches(3.55), Inches(4.3))
        tf_b = bbox.text_frame
        tf_b.word_wrap = True
        p_sub = tf_b.paragraphs[0]
        p_sub.text = subtitle.upper()
        p_sub.font.size = Pt(10)
        p_sub.font.bold = True
        p_sub.font.color.rgb = col

        for item_t, item_d in items:
            p_i = tf_b.add_paragraph()
            p_i.text = f"✔ {item_t}: "
            p_i.font.size = Pt(10)
            p_i.font.bold = True
            p_i.font.color.rgb = NAVY_TEXT
            p_i.space_before = Pt(8)
            run = p_i.add_run()
            run.text = item_d
            run.font.bold = False
            run.font.color.rgb = SLATE_MUTED

    # =========================================================================
    # SLIDE 17: KEY FINDINGS & INSIGHTS
    # =========================================================================
    s17 = prs.slides.add_slide(blank_layout)
    set_slide_background(s17, LIGHT_BG)
    add_header(s17, "Key Analytical Findings & Academic Conclusions", "Results Summary", 17)

    findings = [
        ("Finding 1: Diurnal Bimodal Peak Load",
         "The 168-hour diurnal analysis proved that banking transaction velocity exhibits two daily peaks: a midday lunch surge (12:00–14:00) accounting for 24% of daily volume and an evening retail shopping surge (18:00–20:00). Core banking switches should schedule maintenance windows strictly between 02:00–05:00 AM.",
         BLUE_ACCENT),
        ("Finding 2: Channel Volume vs Value Decoupling",
         "UPI accounts for 62.4% of total transaction count but only 14.8% of aggregate monetary value. Conversely, Bank Transfers represent 8.2% of transactions but 68.3% of total settled capital. Monitoring must evaluate count velocity for infrastructure stress and capital volume for liquidity reserves.",
         TEAL_ACCENT),
        ("Finding 3: Outlier Scoring vs Fraud Separation",
         "Applying robust non-parametric MAD & IQR fences successfully isolated 128 genuine statistical anomalies (such as corporate salary dispersals and end-of-month batch settlements) without generating false fraud allegations, achieving 94% higher specificity than naive 3-sigma methods.",
         AMBER_ACCENT),
        ("Finding 4: Forecasting Horizon Accuracy",
         "The Holt-Winters additive model achieved a Mean Absolute Percentage Error (MAPE) of 5.8% across a 14-day holdout horizon. Incorporating weekly 7-day diurnal periodicity eliminated systematic underestimation on weekend troughs.",
         EMERALD_ACCENT),
    ]

    for idx, (f_title, f_desc, col) in enumerate(findings):
        r = idx // 2
        c = idx % 2
        x = Inches(0.6 + c * 6.2)
        y = Inches(1.6 + r * 2.7)

        f_card = s17.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, y, Inches(6.0), Inches(2.45))
        f_card.fill.solid()
        f_card.fill.fore_color.rgb = WHITE
        f_card.line.color.rgb = col
        f_card.line.width = Pt(1.5)

        tb = s17.shapes.add_textbox(x + Inches(0.3), y + Inches(0.2), Inches(5.4), Inches(2.0))
        tf = tb.text_frame
        tf.word_wrap = True
        p_t = tf.paragraphs[0]
        p_t.text = f_title
        p_t.font.size = Pt(13)
        p_t.font.bold = True
        p_t.font.color.rgb = col

        p_d = tf.add_paragraph()
        p_d.text = f_desc
        p_d.font.size = Pt(10.5)
        p_d.font.color.rgb = NAVY_TEXT
        p_d.space_before = Pt(8)

    # =========================================================================
    # SLIDE 18: CONCLUSION & THANK YOU
    # =========================================================================
    s18 = prs.slides.add_slide(blank_layout)
    set_slide_background(s18, DARK_BG)

    # Ambient Card
    c_card = s18.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.5), Inches(0.8), Inches(10.333), Inches(5.9))
    c_card.fill.solid()
    c_card.fill.fore_color.rgb = CARD_DARK
    c_card.line.color.rgb = RGBColor(30, 41, 59)
    c_card.line.width = Pt(1.5)

    tb = s18.shapes.add_textbox(Inches(2.0), Inches(1.2), Inches(9.333), Inches(5.0))
    tf = tb.text_frame
    tf.word_wrap = True

    p1 = tf.paragraphs[0]
    p1.text = "APEX BANK TRANSACTION INTELLIGENCE"
    p1.font.size = Pt(13)
    p1.font.bold = True
    p1.font.color.rgb = TEAL_ACCENT
    p1.alignment = PP_ALIGN.CENTER

    p2 = tf.add_paragraph()
    p2.text = "Thank You!"
    p2.font.size = Pt(36)
    p2.font.bold = True
    p2.font.color.rgb = WHITE
    p2.alignment = PP_ALIGN.CENTER
    p2.space_before = Pt(8)

    p3 = tf.add_paragraph()
    p3.text = "Questions & Interactive Demonstration"
    p3.font.size = Pt(16)
    p3.font.bold = True
    p3.font.color.rgb = CYAN_ACCENT
    p3.alignment = PP_ALIGN.CENTER
    p3.space_before = Pt(4)

    p4 = tf.add_paragraph()
    p4.text = "The Banking Transaction Intelligence Dashboard successfully integrates advanced time-series visual analytics, non-parametric statistical surveillance, machine learning forecasting, and bank account role governance into a responsive web application."
    p4.font.size = Pt(11)
    p4.font.color.rgb = RGBColor(203, 213, 225)
    p4.alignment = PP_ALIGN.CENTER
    p4.space_before = Pt(16)

    # Summary Badges Box
    box_s = s18.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(2.2), Inches(4.3), Inches(8.933), Inches(1.8))
    box_s.fill.solid()
    box_s.fill.fore_color.rgb = RGBColor(11, 18, 38)
    box_s.line.color.rgb = RGBColor(51, 65, 85)
    box_s.line.width = Pt(1)

    tb_s = s18.shapes.add_textbox(Inches(2.4), Inches(4.45), Inches(8.533), Inches(1.5))
    tf_s = tb_s.text_frame
    tf_s.word_wrap = True

    p_cred = tf_s.paragraphs[0]
    p_cred.text = "CANDIDATE: Karthick M • Reg No: 21BCE0000"
    p_cred.font.size = Pt(12)
    p_cred.font.bold = True
    p_cred.font.color.rgb = WHITE
    p_cred.alignment = PP_ALIGN.CENTER

    p_proj = tf_s.add_paragraph()
    p_proj.text = "Course: Advanced Data Visualization (ADVT) • School of Computer Science"
    p_proj.font.size = Pt(11)
    p_proj.font.color.rgb = TEAL_ACCENT
    p_proj.alignment = PP_ALIGN.CENTER
    p_proj.space_before = Pt(4)

    p_links = tf_s.add_paragraph()
    p_links.text = "GitHub Repository: https://github.com/YOUR_GITHUB_USERNAME/apex-bank-dashboard\nLive URL: https://banking-intelligence-1.onrender.com"
    p_links.font.size = Pt(10)
    p_links.font.color.rgb = SLATE_MUTED
    p_links.alignment = PP_ALIGN.CENTER
    p_links.space_before = Pt(6)

    # Save presentation
    output_path = os.path.abspath("Banking_Transaction_Intelligence_Dashboard.pptx")
    prs.save(output_path)
    print(f"Presentation saved successfully to: {output_path}")

if __name__ == "__main__":
    create_deck()
