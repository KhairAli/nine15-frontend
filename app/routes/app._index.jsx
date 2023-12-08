import { useEffect, useState, useCallback } from "react";
import {
  Page,
  Layout,
  Card,
  BlockStack,
  Select,
  DataTable,
  Button
} from "@shopify/polaris";

const API_URl = "https://931b-37-111-189-46.ngrok-free.app";

const toDateFormat = (isoDateString) => {
  // Create a new Date object
  const date = new Date(isoDateString);

  // Get the day, month, and year from the date object
  const day = date.getUTCDate().toString().padStart(2, '0');
  const month = (date.getUTCMonth() + 1).toString().padStart(2, '0'); // getUTCMonth() is zero-indexed
  const year = date.getUTCFullYear();

  // Get the hours and minutes from the date object
  const hours = date.getUTCHours().toString().padStart(2, '0');
  const minutes = date.getUTCMinutes().toString().padStart(2, '0');

  return `${day}-${month}-${year} ${hours}:${minutes}`;
}

const fetchProductPriceHistory = (productId) => {
  return fetch(`${API_URl}/api/product/price-history/${productId}`)
    .then(response => response.json())
    .catch(error => console.error(error));
}

const fetchProducts = () => {
  return fetch(`${API_URl}/api/product/all`)
    .then(response => response.json())
    .catch(error => console.error(error));
}

const SelectProduct = ({ productOptions, onProductChange }) => {
  const [selected, setSelected] = useState(undefined);

  const handleSelectChange = useCallback(
    (value) => {
      setSelected(value);
      if (onProductChange) {
        onProductChange(value);
      }
    },
    [onProductChange],
  );

  return (
    <Select
      label="Products"
      options={productOptions}
      onChange={handleSelectChange}
      value={selected}
    />
  );
}

function ProductTable({ product }) {
  const rows = product.priceHistories?.map(({ sku, price, updatedAt }) => [
    sku,
    price,
    toDateFormat(updatedAt)
  ]);

  console.log(rows)

  return (
    <div>
      <Card>
        <DataTable
          columnContentTypes={[
            'text',
            'text',
            'text',
          ]}
          headings={[
            'SKU',
            'Price',
            'Updated At'
          ]}
          rows={rows}
        />
      </Card>
    </div>
  );
}


export default function Index() {
  const [options, setOptions] = useState([]);
  const [productHistory, setProductHistory] = useState(undefined);

  const handleRefresh = () => {
    fetchProducts()
      .then(response => {
        console.log(response)
        let labelValues = response.map(product => ({
          label: product.productName,
          value: product.productId
        }))
        setOptions(labelValues);
      })

  }


  useEffect(() => {
    fetchProducts()
      .then(response => {
        console.log(response)
        let labelValues = [{
          label: 'Select Product',
          value: 'Select Product'
        }];
        if (response) {
          labelValues = labelValues.concat(response.map(product => ({
            label: product.productName,
            value: product.productId
          })))
        }
        setOptions(labelValues);
      })

  }, []);

  const handleProductChange = async (productId) => {
    let data = await fetchProductPriceHistory(productId);
    setProductHistory(data)
  };



  return (
    <Page>
      <BlockStack gap="500">
        <Layout>
          <Layout.Section>
            <Card>
              <SelectProduct productOptions={options} onProductChange={handleProductChange} />
              <Button onClick={handleRefresh} style={{ marginTop: '10px' }} >Refresh Products</Button>
            </Card>
            <div>
              {productHistory != undefined && productHistory != null ? (
                <ProductTable product={productHistory} />
              ) : (
                <div>No product history available.</div>
              )}
            </div>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}