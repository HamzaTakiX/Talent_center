from rest_framework import serializers

ANALYSIS_MODES = ('full', 'language', 'coherence', 'structure', 'formatting')
MAX_PAGE_CHARS = 20_000
MIN_PAGE_CHARS = 1


class OutlineItemSerializer(serializers.Serializer):
    level = serializers.IntegerField(min_value=1, max_value=6, required=False, default=1)
    title = serializers.CharField(max_length=500, required=False, allow_blank=True, default='')
    number = serializers.CharField(max_length=64, required=False, allow_blank=True, default='')


class PagePayloadSerializer(serializers.Serializer):
    text = serializers.CharField(allow_blank=True, max_length=MAX_PAGE_CHARS)
    html = serializers.CharField(required=False, allow_blank=True, default='', max_length=MAX_PAGE_CHARS * 3)
    headings = serializers.ListField(
        child=serializers.CharField(max_length=500),
        required=False,
        default=list,
        max_length=100,
    )
    figures = serializers.ListField(
        child=serializers.CharField(max_length=500),
        required=False,
        default=list,
        max_length=100,
    )
    tables = serializers.ListField(
        child=serializers.CharField(max_length=500),
        required=False,
        default=list,
        max_length=100,
    )
    captions = serializers.ListField(
        child=serializers.CharField(max_length=500),
        required=False,
        default=list,
        max_length=100,
    )


class ContextPayloadSerializer(serializers.Serializer):
    chapterTitle = serializers.CharField(required=False, allow_blank=True, default='', max_length=500)
    sectionTitle = serializers.CharField(required=False, allow_blank=True, default='', max_length=500)
    previousExcerpt = serializers.CharField(required=False, allow_blank=True, default='', max_length=2000)
    nextExcerpt = serializers.CharField(required=False, allow_blank=True, default='', max_length=2000)
    outline = OutlineItemSerializer(many=True, required=False, default=list)


class AnalyzePageSerializer(serializers.Serializer):
    reportId = serializers.CharField(max_length=128)
    pageNumber = serializers.IntegerField(min_value=1)
    pageId = serializers.CharField(required=False, allow_blank=True, max_length=64, default='')
    contentHash = serializers.CharField(max_length=64)
    includeContext = serializers.BooleanField(required=False, default=True)
    mode = serializers.ChoiceField(choices=ANALYSIS_MODES, default='full')
    page = PagePayloadSerializer()
    context = ContextPayloadSerializer(required=False, default=dict)

    def validate_page(self, value):
        text = (value.get('text') or '').strip()
        if len(text) < MIN_PAGE_CHARS:
            raise serializers.ValidationError({'text': ['Page content is empty.']})
        if len(text) > MAX_PAGE_CHARS:
            raise serializers.ValidationError({'text': [f'Page exceeds {MAX_PAGE_CHARS} characters.']})
        return value

    def validate(self, attrs):
        page_id = (attrs.get('pageId') or '').strip()
        if not page_id:
            attrs['pageId'] = f"page-{attrs['pageNumber']}"
        return attrs
