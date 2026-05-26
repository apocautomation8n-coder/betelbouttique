import express from 'express'
import supabase from '../supabaseAdmin.js'

const router = express.Router()

router.post('/check-stock', async (req, res) => {
  try {
    let body = req.body
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body)
      } catch (e) {
        return res.status(400).json({ error: 'Invalid JSON body' })
      }
    }
    
    const { talle, tipo_prenda, prenda_especifica } = body
    if (!talle) {
      return res.status(400).json({ error: 'El talle es requerido' })
    }

    // 1. Buscar la prenda que pide el usuario
    let query = supabase
      .from('products')
      .select(`
        id,
        name,
        categories!inner(name),
        product_variants!inner(size, color, stock)
      `)
      .gt('product_variants.stock', 0)
      .ilike('product_variants.size', `%${talle}%`)
      .eq('status', 'active')

    if (tipo_prenda) {
      query = query.ilike('categories.name', `%${tipo_prenda}%`)
    }

    if (prenda_especifica) {
      query = query.ilike('name', `%${prenda_especifica}%`)
    }

    const { data: requestedProducts, error } = await query

    if (error) {
      console.error('Error querying products:', error)
      return res.status(500).json({ error: 'Error interno del servidor al consultar stock' })
    }

    if (requestedProducts && requestedProducts.length > 0) {
      // Formatear la respuesta para el agente IA
      const available = requestedProducts.map(p => ({
        nombre: p.name,
        categoria: p.categories?.name,
        variantes: p.product_variants.map(v => ({ talle: v.size, color: v.color, stock: v.stock }))
      }))

      return res.json({
        disponible: true,
        mensaje: 'Hay stock disponible.',
        productos: available
      })
    }

    // 2. Si no hay, buscar recomendaciones en el mismo talle pero distinta prenda o en general
    let recQuery = supabase
      .from('products')
      .select(`
        id,
        name,
        categories!inner(name),
        product_variants!inner(size, color, stock)
      `)
      .gt('product_variants.stock', 0)
      .ilike('product_variants.size', `%${talle}%`)
      .eq('status', 'active')
      .limit(5)

    // Excluir la categoría que se buscó originalmente para ofrecer otra cosa (ej: si buscó remera, ofrecer buzos)
    if (tipo_prenda) {
      // Como Supabase PostgREST no soporta 'not.ilike' fácilmente con joins de esta forma en un inner join simple, 
      // podemos traer productos del talle y luego filtrarlos en memoria (limitado)
      // O simplemente buscar algo que NO sea esa categoria:
    }

    const { data: recommendedData, error: recError } = await recQuery

    if (recError) {
      console.error('Error querying recommendations:', recError)
      return res.json({
        disponible: false,
        mensaje: 'No hay stock disponible de lo solicitado y no se pudieron cargar recomendaciones.',
        recomendaciones: []
      })
    }

    // Filtrar recomendaciones para que sean de un 'tipo_prenda' diferente si es posible
    let recommendations = recommendedData || []
    if (tipo_prenda) {
      const filtered = recommendations.filter(p => !p.categories.name.toLowerCase().includes(tipo_prenda.toLowerCase()))
      if (filtered.length > 0) {
        recommendations = filtered
      }
    }

    const recFormatted = recommendations.map(p => ({
      nombre: p.name,
      categoria: p.categories?.name,
      variantes: p.product_variants.map(v => ({ talle: v.size, color: v.color, stock: v.stock }))
    }))

    return res.json({
      disponible: false,
      mensaje: `No hay stock de lo que buscas en talle ${talle}. Te recomendamos estas otras opciones en el mismo talle.`,
      recomendaciones: recFormatted.slice(0, 3) // Devolver hasta 3 recomendaciones
    })

  } catch (error) {
    console.error('Check stock error:', error)
    return res.status(500).json({ error: 'Error del servidor' })
  }
})

export default router
