namespace ProjectDOr.Domains
{

    //This class was created to get all the custom JSON fields that come from the freshdesk api request
    public class TimeStampRequest
    {
        public int ticketId { get; set; }
        public CustomFields customFields { get; set; }
    }

    public class CustomFields
    {
        public string cf_categoria35410 { get; set; }
        public string cf_subcategoria515652 { get; set; }
        public string cf_categoria612365{ get; set; }
        public string cf_subcategoria946280 { get; set; }
        public string cf_categoria224857 { get; set; }
        public string cf_subcategoria65140 { get; set; }
        public string cf_categoria931201 { get; set; }
        public string cf_subcategoria618998 { get; set; }
        public string cf_produtooperadora988876 { get; set; }
        public string cf_produtooperadora303309 { get; set; }
        public string cf_produtooperadora276233 { get; set; }
        public string cf_produtooperadora708005 { get; set; }
        public string cf_produtooperadora { get; set; }
        public string cf_categoria { get; set; }
        public string cf_subcategoria { get; set; }
        public string cf_cliente { get; set; }
        public string cf_produtooperadora682826 { get; set; }
        public string cf_categoria321626 { get; set; }
        public string cf_subcategoria559641 { get; set; }
    }
}
