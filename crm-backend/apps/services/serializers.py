from rest_framework import serializers
from .models import CustomerService


class CustomerServiceSerializer(serializers.ModelSerializer):
    children = serializers.SerializerMethodField()

    class Meta:
        model = CustomerService
        fields = [
            'id', 'customer', 'parent', 'acesso', 'tarifario', 'operadora',
            'valor', 'moeda', 'conta', 'cvp', 'data_fim', 'num_client',
            'num_servico', 'morada', 'observacoes', 'created_at', 'children'
        ]
        read_only_fields = ['id', 'created_at', 'children']

    def get_children(self, obj):
        if obj.parent is None:
            children = obj.children.all()
            return CustomerServiceSerializer(children, many=True).data
        return []

    def validate(self, attrs):
        parent = attrs.get('parent')
        customer = attrs.get('customer')

        if parent:
            # Sub-services cannot have their own sub-services
            if parent.parent is not None:
                raise serializers.ValidationError({
                    'parent': 'Sub-services cannot have their own sub-services (max 1 level of nesting).'
                })
            # Parent service must belong to the same customer
            if parent.customer_id != customer.id:
                raise serializers.ValidationError({
                    'parent': 'Parent service must belong to the same customer.'
                })

        return attrs


class CustomerServiceCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomerService
        fields = [
            'id', 'parent', 'acesso', 'tarifario', 'operadora',
            'valor', 'moeda', 'conta', 'cvp', 'data_fim', 'num_client',
            'num_servico', 'morada', 'observacoes', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']

    def validate(self, attrs):
        parent = attrs.get('parent')
        customer = self.context.get('customer')

        if parent:
            # Sub-services cannot have their own sub-services
            if parent.parent is not None:
                raise serializers.ValidationError({
                    'parent': 'Sub-services cannot have their own sub-services (max 1 level of nesting).'
                })
            # Parent service must belong to the same customer
            if parent.customer_id != customer.id:
                raise serializers.ValidationError({
                    'parent': 'Parent service must belong to the same customer.'
                })

        return attrs

    def create(self, validated_data):
        customer = self.context.get('customer')
        validated_data['customer'] = customer
        return super().create(validated_data)
