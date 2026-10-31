from rest_framework import serializers
from .models import Customer, CustomerAddress, Tag


class TagSerializer(serializers.ModelSerializer):
    # Annotated by TagViewSet; absent when nested in a customer.
    customer_count = serializers.IntegerField(read_only=True, required=False)

    class Meta:
        model = Tag
        fields = ['id', 'name', 'color', 'customer_count']
        read_only_fields = ['id']

    def validate_name(self, value):
        name = ' '.join(value.split())
        if not name:
            raise serializers.ValidationError('O nome não pode estar vazio.')
        clash = Tag.objects.filter(name__iexact=name)
        if self.instance:
            clash = clash.exclude(pk=self.instance.pk)
        if clash.exists():
            raise serializers.ValidationError('Já existe uma etiqueta com este nome.')
        return name


class CustomerSerializer(serializers.ModelSerializer):
    tags = TagSerializer(many=True, read_only=True)
    # Write side: PATCH {"tag_ids": [1, 2]} replaces the customer's tags.
    tag_ids = serializers.PrimaryKeyRelatedField(
        many=True, write_only=True, required=False, source='tags', queryset=Tag.objects.all(),
    )

    class Meta:
        model = Customer
        fields = [
            'id', 'name', 'email', 'phone', 'company', 'nif', 'iban', 'decisor', 'segment',
            'status', 'tags', 'tag_ids', 'created_at',
        ]
        read_only_fields = ['id', 'created_at']


class CustomerSuggestionSerializer(serializers.ModelSerializer):
    """The few fields the search-as-you-type dropdown renders."""

    class Meta:
        model = Customer
        fields = ['id', 'name', 'company', 'nif', 'email', 'phone', 'status']
        read_only_fields = fields


class CustomerAddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomerAddress
        fields = ['id', 'customer', 'street', 'postal_code', 'district', 'municipality', 'parish', 'country']
        read_only_fields = ['id', 'customer']
