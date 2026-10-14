import io
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from app.services.dataset_service import dataset_manager
from app.analytics.kpi import calculate_kpis

def generate_analytics_pdf(
    start_date: str = None,
    end_date: str = None,
    transaction_type: str = None,
    branch: str = None
) -> bytes:
    """
    Generates a professional academic executive analytics report in PDF format
    using current dataset metrics, filters, and findings.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontSize=20,
        leading=24,
        textColor=colors.HexColor('#0a1128'),
        spaceAfter=6
    )
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontSize=11,
        leading=14,
        textColor=colors.HexColor('#475569'),
        spaceAfter=15
    )
    heading_style = ParagraphStyle(
        'SectionHeading',
        parent=styles['Heading2'],
        fontSize=13,
        leading=17,
        textColor=colors.HexColor('#1e293b'),
        spaceBefore=12,
        spaceAfter=6
    )
    body_style = ParagraphStyle(
        'BodyDark',
        parent=styles['Normal'],
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#334155'),
        spaceAfter=6
    )
    callout_style = ParagraphStyle(
        'Callout',
        parent=styles['Normal'],
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor('#0f766e'),
        backColor=colors.HexColor('#f0fdfa'),
        borderColor=colors.HexColor('#ccfbf1'),
        borderWidth=1,
        borderPadding=6,
        spaceAfter=10
    )

    story = []

    # Title & Metadata
    story.append(Paragraph("Banking Transaction Intelligence Dashboard", title_style))
    story.append(Paragraph(
        f"<b>Academic Analytical Report</b> &bull; Generated: {datetime.now().strftime('%d %B %Y, %H:%M')} &bull; Subject: Advanced Data Visualization",
        subtitle_style
    ))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#cbd5e1'), spaceAfter=12))

    # Dataset & Filter Scope
    summary = dataset_manager.get_summary()
    kpi_data = calculate_kpis(start_date=start_date, end_date=end_date, transaction_type=transaction_type, branch=branch)

    dataset_type_badge = "Simulated / Synthetic Benchmark Dataset" if summary.is_synthetic else "Verified Custom Ingested Dataset"
    story.append(Paragraph("1. Dataset Scope & Execution Parameters", heading_style))
    story.append(Paragraph(
        f"<b>Source Designation:</b> {summary.name} ({dataset_type_badge})<br/>"
        f"<b>Analysis Period:</b> {start_date or summary.start_date} to {end_date or summary.end_date}<br/>"
        f"<b>Active Filters:</b> Transaction Type: {transaction_type or 'All'} | Branch: {branch or 'All'}<br/>"
        f"<b>Record Integrity:</b> {summary.valid_rows:,} Valid Transactions | {summary.invalid_rows:,} Rejected Records | {summary.duplicate_ids} Duplicate Identifiers",
        body_style
    ))

    # KPI Table
    story.append(Paragraph("2. Primary Key Performance Indicators", heading_style))
    kpi_table_data = [
        ["Total Volume", "Aggregate Value", "Mean Txn Value", "Success Rate", "Failed Count", "Stat. Outliers"],
        [
            f"{kpi_data['total_transactions']:,}",
            f"INR {kpi_data['total_transaction_value']:,.2f}",
            f"INR {kpi_data['average_transaction_value']:,.2f}",
            f"{kpi_data['successful_transaction_rate']:.2f}%",
            f"{kpi_data['failed_transaction_count']:,}",
            f"{kpi_data['flagged_anomalies_count']:,}"
        ]
    ]
    t = Table(kpi_table_data, colWidths=[90, 105, 95, 80, 80, 85])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0f172a')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 8),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BACKGROUND', (0, 1), (-1, 1), colors.HexColor('#f8fafc')),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
    ]))
    story.append(t)
    story.append(Spacer(1, 10))

    # Analytical Methodology
    story.append(Paragraph("3. Analytical & Time-Series Methodology", heading_style))
    story.append(Paragraph(
        "<b>Smoothing & Moving Averages:</b> A two-tiered rolling average window (7-day and 30-day) is computed to isolate weekly diurnal variance and extract macroeconomic month-over-month trajectory trends without shifting temporal phase.<br/>"
        "<b>Temporal Heatmap Analysis:</b> Timestamps are cross-classified across 24 hourly bins and 7 day-of-week slots to expose peak server load periods and off-hour liquidity cycles.<br/>"
        "<b>Statistical Outlier Identification:</b> Anomaly detection employs non-parametric Median Absolute Deviation (MAD) robust Z-scores alongside Interquartile Range (IQR) outer fences. Zero-MAD conditions are guarded with standard variance dampening.",
        body_style
    ))

    # Anomaly & Fraud Clarification
    story.append(Paragraph(
        "<b>Important Scientific Clarification:</b> Statistical anomalies flagged in this report represent deviations from historical aggregate expectations (e.g., month-end surges, high-value corporate transfers, or network gateway timeouts). Under no circumstances does a statistical anomaly constitute evidence or proof of fraudulent activity.",
        callout_style
    ))

    # Academic Limitations & Conclusion
    story.append(Paragraph("4. Academic Limitations & System Conclusions", heading_style))
    story.append(Paragraph(
        "1. <b>Sampling Granularity:</b> Daily aggregation masks intra-day high-frequency microbursts occurring over millisecond windows.<br/>"
        "2. <b>Stationarity:</b> Financial transaction series exhibit non-stationary trend and seasonal components; Holt-Winters and ARIMA models require regular re-estimation.<br/>"
        "3. <b>Summary:</b> The platform achieves complete end-to-end transparency, offering multi-dimensional visualization across payment modes, branches, and temporal intervals with reproducible scientific metrics.",
        body_style
    ))

    doc.build(story)
    buffer.seek(0)
    return buffer.getvalue()
