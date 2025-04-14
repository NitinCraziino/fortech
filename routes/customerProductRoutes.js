router.put("/:id/tax-status", jwtAuthMiddleware, async (req, res) => {
  try {
    const customerProduct = await CustomerProduct.findOne({ customerId: req.params.id });
    if (!customerProduct) {
      return res.status(404).json({ message: "Customer products not found" });
    }
    
    customerProduct.taxEnabled = !customerProduct.taxEnabled;
    await customerProduct.save();
    
    res.json({ taxEnabled: customerProduct.taxEnabled });
  } catch (error) {
    res.status(500).json({ message: "Error updating tax status" });
  }
}); 