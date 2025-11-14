
import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Loader2 } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/components/ui/use-toast';
import { getProducts, getProductQuantities } from '@/api/EcommerceApi';
import { cn } from '@/lib/utils';

const ProductCard = ({ product, index, isCompact }) => {
  const { addToCart } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();

  const displayVariant = useMemo(() => product.variants[0], [product]);
  const hasSale = useMemo(() => displayVariant && displayVariant.sale_price_in_cents !== null, [displayVariant]);
  const displayPrice = useMemo(() => hasSale ? displayVariant.sale_price_formatted : displayVariant.price_formatted, [displayVariant, hasSale]);
  const originalPrice = useMemo(() => hasSale ? displayVariant.price_formatted : null, [displayVariant, hasSale]);

  const handleAddToCart = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (product.variants.length > 1) {
      navigate(`/product/${product.id}`);
      return;
    }

    const defaultVariant = product.variants[0];

    try {
      await addToCart(product, defaultVariant, 1, defaultVariant.inventory_quantity);
      toast({
        title: "Adicionado ao Carrinho! 🛒",
        description: `${product.title} foi adicionado ao seu carrinho.`,
      });
    } catch (error) {
      toast({
        title: "Erro ao adicionar ao carrinho",
        description: error.message,
      });
    }
  }, [product, addToCart, toast, navigate]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
    >
      <Link to={`/product/${product.id}`}>
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm glass-card-dark border-0 text-white overflow-hidden group transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 h-full flex flex-col">
          <div className="relative">
            <img
              alt={product.title}
              className={cn("w-full object-cover transition-transform duration-300", isCompact ? 'h-40' : 'h-64')}
             src="https://images.unsplash.com/photo-1559223669-e0065fa7f142" />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all duration-300" />
            {product.ribbon_text && (
              <div className="absolute top-2 left-2 bg-pink-500/90 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-lg">
                {product.ribbon_text}
              </div>
            )}
            <div className="absolute top-2 right-2 bg-purple-500/80 text-white text-xs font-bold px-2 py-0.5 rounded-full flex items-baseline gap-1">
              {hasSale && (
                <span className="line-through opacity-70 text-[10px]">{originalPrice}</span>
              )}
              <span className="text-[11px]">{displayPrice}</span>
            </div>
          </div>
          <div className="p-3 flex-grow flex flex-col">
            <h3 className={cn("font-bold truncate", isCompact ? "text-sm" : "text-lg")}>{product.title}</h3>
            {!isCompact && (
              <p className="text-sm text-gray-300 h-10 overflow-hidden">{product.subtitle || 'Confira este produto incrível!'}</p>
            )}
            <div className="mt-auto pt-2">
              <Button onClick={handleAddToCart} size={isCompact ? 'sm' : 'default'} className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold">
                <ShoppingCart className={cn("mr-2", isCompact ? "h-3 w-3" : "h-4 w-4")} />
                <span className={cn(isCompact ? "text-xs" : "")}>Adicionar</span>
              </Button>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

const ProductsList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCompact, setIsCompact] = useState(true);

  useEffect(() => {
    const fetchProductsWithQuantities = async () => {
      try {
        setLoading(true);
        setError(null);

        const productsResponse = await getProducts();

        if (productsResponse.products.length === 0) {
          setProducts([]);
          return;
        }

        const productIds = productsResponse.products.map(product => product.id);

        const quantitiesResponse = await getProductQuantities({
          fields: 'inventory_quantity',
          product_ids: productIds
        });

        const variantQuantityMap = new Map();
        quantitiesResponse.variants.forEach(variant => {
          variantQuantityMap.set(variant.id, variant.inventory_quantity);
        });

        const productsWithQuantities = productsResponse.products.map(product => ({
          ...product,
          variants: product.variants.map(variant => ({
            ...variant,
            inventory_quantity: variantQuantityMap.get(variant.id) ?? variant.inventory_quantity
          }))
        }));

        setProducts(productsWithQuantities);
      } catch (err) {
        setError(err.message || 'Falha ao carregar produtos');
      } finally {
        setLoading(false);
      }
    };

    fetchProductsWithQuantities();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-16 w-16 text-white animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-400 p-8">
        <p>Erro ao carregar produtos: {error}</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center text-gray-400 p-8">
        <p>Nenhum produto disponível no momento.</p>
      </div>
    );
  }

  const gridCols = isCompact ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6' : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4';

  return (
    <div className={`grid ${gridCols} gap-4`}>
      {products.map((product, index) => (
        <ProductCard key={product.id} product={product} index={index} isCompact={isCompact} />
      ))}
    </div>
  );
};

export default ProductsList;
